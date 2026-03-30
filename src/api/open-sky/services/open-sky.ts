const OPEN_SKY_URL = 'https://opensky-network.org/api/states/all';
const MAX_RENDERED_FLIGHTS = 120;
const CACHE_TTL_MS = 15_000;
const FETCH_TIMEOUT_MS = 8_000;

const REGION_PRESETS = {
  italy: {
    label: 'Italia',
    description: 'Traffico sopra Italia e area alpina vicina.',
    bounds: {
      lamin: 36.4,
      lamax: 47.8,
      lomin: 6.2,
      lomax: 19.2,
    },
  },
  mediterranean: {
    label: 'Mediterraneo',
    description: 'Corridoio ampio tra Italia, Balcani e coste nord-africane.',
    bounds: {
      lamin: 30,
      lamax: 48,
      lomin: 2,
      lomax: 24,
    },
  },
  europe: {
    label: 'Europa',
    description: 'Vista ampia dei principali flussi aerei europei.',
    bounds: {
      lamin: 35,
      lamax: 58,
      lomin: -11,
      lomax: 31,
    },
  },
} as const;

type RegionKey = keyof typeof REGION_PRESETS;
type FlightSnapshot = NonNullable<ReturnType<typeof normalizeFlight>>;
type SnapshotResult = {
  fetchedAt: string;
  flights: FlightSnapshot[];
  region: {
    bounds: (typeof REGION_PRESETS)[RegionKey]['bounds'];
    description: string;
    key: RegionKey;
    label: string;
  };
  source: string;
  totals: {
    airborne: number;
    averageAltitudeMeters: number | null;
    fastestVelocityKmh: number | null;
    onGround: number;
    rendered: number;
    tracked: number;
  };
};

type OpenSkyStateVector = [
  string | null,
  string | null,
  string | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  boolean | null,
  number | null,
  number | null,
  number | null,
  number[] | null,
  number | null,
  string | null,
  boolean | null,
  number | null,
  number | null,
];

const isRegionKey = (value: string): value is RegionKey => value in REGION_PRESETS;

const toOptionalNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const toOptionalString = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

const normalizeFlight = (state: OpenSkyStateVector, snapshotTime: number) => {
  const longitude = toOptionalNumber(state[5]);
  const latitude = toOptionalNumber(state[6]);

  if (longitude === null || latitude === null) {
    return null;
  }

  const velocityMetersPerSecond = toOptionalNumber(state[9]);
  const altitudeMeters = toOptionalNumber(state[13]) ?? toOptionalNumber(state[7]);
  const lastContact = toOptionalNumber(state[4]) ?? snapshotTime;
  const onGround = state[8] === true;
  const trueTrack = toOptionalNumber(state[10]);

  return {
    icao24: toOptionalString(state[0]) ?? 'unknown',
    callsign: toOptionalString(state[1]),
    originCountry: toOptionalString(state[2]) ?? 'N/D',
    latitude: round(latitude, 4),
    longitude: round(longitude, 4),
    altitudeMeters: altitudeMeters !== null ? Math.round(altitudeMeters) : null,
    onGround,
    velocityKmh:
      velocityMetersPerSecond !== null ? Math.round(velocityMetersPerSecond * 3.6) : null,
    trueTrack: trueTrack !== null ? Math.round(trueTrack) : null,
    verticalRate: toOptionalNumber(state[11]),
    lastContact,
    lastSeenSecondsAgo: Math.max(0, snapshotTime - lastContact),
  };
};

const getFastestVelocity = (flights: Array<{ velocityKmh: number | null }>) => {
  const velocities = flights
    .map((flight) => flight.velocityKmh)
    .filter((value): value is number => value !== null);

  return velocities.length > 0 ? Math.max(...velocities) : null;
};

const getAverageAltitude = (flights: Array<{ altitudeMeters: number | null; onGround: boolean }>) => {
  const airborneAltitudes = flights
    .filter((flight) => !flight.onGround && flight.altitudeMeters !== null)
    .map((flight) => flight.altitudeMeters as number);

  if (airborneAltitudes.length === 0) {
    return null;
  }

  const total = airborneAltitudes.reduce((sum, altitude) => sum + altitude, 0);
  return Math.round(total / airborneAltitudes.length);
};

const snapshotCache = new Map<RegionKey, { data: SnapshotResult; expiresAt: number }>();
const inflightSnapshots = new Map<RegionKey, Promise<SnapshotResult>>();

export default () => ({
  async getSnapshot(inputRegion?: string) {
    const region = inputRegion && isRegionKey(inputRegion) ? inputRegion : 'italy';
    const preset = REGION_PRESETS[region];
    const now = Date.now();
    const cachedSnapshot = snapshotCache.get(region);

    if (cachedSnapshot && cachedSnapshot.expiresAt > now) {
      return cachedSnapshot.data;
    }

    const inflightSnapshot = inflightSnapshots.get(region);

    if (inflightSnapshot) {
      return inflightSnapshot;
    }

    const snapshotPromise = (async () => {
      const url = new URL(OPEN_SKY_URL);
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), FETCH_TIMEOUT_MS);

      Object.entries(preset.bounds).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });

      try {
        const response = await fetch(url.toString(), {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'strapi-demo-website/opensky-dashboard',
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('OpenSky Network ha temporaneamente limitato le richieste anonime.');
          }

          throw new Error(`OpenSky Network ha risposto con stato ${response.status}.`);
        }

        const payload = (await response.json()) as {
          states?: OpenSkyStateVector[];
          time?: number;
        };

        const snapshotTime =
          typeof payload.time === 'number' && Number.isFinite(payload.time)
            ? payload.time
            : Math.floor(Date.now() / 1000);

        const normalizedFlights = Array.isArray(payload.states)
          ? payload.states
              .map((state) => normalizeFlight(state, snapshotTime))
              .filter((flight): flight is FlightSnapshot => flight !== null)
          : [];

        const sortedFlights = [...normalizedFlights].sort((left, right) => {
          if (left.onGround !== right.onGround) {
            return left.onGround ? 1 : -1;
          }

          if (left.lastContact !== right.lastContact) {
            return right.lastContact - left.lastContact;
          }

          return (right.velocityKmh ?? 0) - (left.velocityKmh ?? 0);
        });

        const renderedFlights = sortedFlights.slice(0, MAX_RENDERED_FLIGHTS);
        const airborneCount = normalizedFlights.filter((flight) => !flight.onGround).length;

        const snapshot: SnapshotResult = {
          source: 'OpenSky Network',
          fetchedAt: new Date(snapshotTime * 1000).toISOString(),
          region: {
            key: region,
            label: preset.label,
            description: preset.description,
            bounds: preset.bounds,
          },
          totals: {
            tracked: normalizedFlights.length,
            rendered: renderedFlights.length,
            airborne: airborneCount,
            onGround: normalizedFlights.length - airborneCount,
            averageAltitudeMeters: getAverageAltitude(normalizedFlights),
            fastestVelocityKmh: getFastestVelocity(normalizedFlights),
          },
          flights: renderedFlights,
        };

        snapshotCache.set(region, {
          data: snapshot,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });

        return snapshot;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('OpenSky Network non ha risposto in tempo utile.');
        }

        throw error;
      } finally {
        clearTimeout(timeoutId);
        inflightSnapshots.delete(region);
      }
    })();

    inflightSnapshots.set(region, snapshotPromise);

    return snapshotPromise;
  },
});
