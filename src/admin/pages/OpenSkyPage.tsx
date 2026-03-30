import * as React from 'react';

import { Box, Button, Flex, Grid, Typography } from '@strapi/design-system';
import { Layouts, Page, useFetchClient } from '@strapi/strapi/admin';
import { feature } from 'topojson-client';
import countriesAtlas from 'world-atlas/countries-110m.json';

import { OPEN_SKY_READ_PERMISSIONS } from '../../open-sky-permissions';

type RegionKey = 'italy' | 'mediterranean' | 'europe';

type Flight = {
  altitudeMeters: number | null;
  callsign: string | null;
  icao24: string;
  lastContact: number;
  lastSeenSecondsAgo: number;
  latitude: number;
  longitude: number;
  onGround: boolean;
  originCountry: string;
  trueTrack: number | null;
  velocityKmh: number | null;
  verticalRate: number | null;
};

type SnapshotPayload = {
  fetchedAt: string;
  flights: Flight[];
  region: {
    bounds: {
      lamax: number;
      lamin: number;
      lomax: number;
      lomin: number;
    };
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

type SnapshotResponse = {
  data: SnapshotPayload;
};

type GeoPoint = readonly [longitude: number, latitude: number];
type GeoBounds = SnapshotPayload['region']['bounds'];
type GeoGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: GeoPoint[][] | GeoPoint[][][];
};
type GeoFeature = {
  geometry: GeoGeometry | null;
};
type MapLabel = {
  point: GeoPoint;
  text: string;
};

const REGION_OPTIONS: Array<{ description: string; key: RegionKey; label: string }> = [
  {
    key: 'italy',
    label: 'Italia',
    description: 'Focus stretto per una lettura piu` chiara del traffico locale.',
  },
  {
    key: 'mediterranean',
    label: 'Mediterraneo',
    description: 'Rotte piu` ampie tra Italia, Balcani e Nord Africa.',
  },
  {
    key: 'europe',
    label: 'Europa',
    description: 'Vista piu` densa per osservare i corridoi aerei maggiori.',
  },
];

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 680;
const FEATURED_FLIGHTS_PAGE_SIZE = 4;
const REGION_LABELS: Record<RegionKey, MapLabel[]> = {
  italy: [
    { text: 'ITALIA', point: [12.4, 42.3] },
    { text: 'SARDEGNA', point: [8.7, 40.0] },
    { text: 'SICILIA', point: [14.0, 37.7] },
    { text: 'ADRIATICO', point: [16.3, 43.3] },
  ],
  mediterranean: [
    { text: 'ITALIA', point: [12.3, 42.2] },
    { text: 'BALCANI', point: [19.0, 43.5] },
    { text: 'TUNISIA', point: [10.0, 34.8] },
    { text: 'GRECIA', point: [22.0, 39.1] },
  ],
  europe: [
    { text: 'SPAGNA', point: [-3.5, 40.2] },
    { text: 'FRANCIA', point: [2.4, 46.1] },
    { text: 'GERMANIA', point: [10.2, 50.8] },
    { text: 'ITALIA', point: [12.4, 42.2] },
    { text: 'REGNO UNITO', point: [-2.7, 54.3] },
    { text: 'BALCANI', point: [19.2, 44.0] },
  ],
};

const WORLD_COUNTRY_FEATURES = (
  feature(countriesAtlas as never, (countriesAtlas as { objects: { countries: never } }).objects.countries) as {
    features: GeoFeature[];
  }
).features;

const REFRESH_INTERVAL_MS = 20_000;
const NUMBER_FORMATTER = new Intl.NumberFormat('it-IT');
const SPEED_FORMATTER = new Intl.NumberFormat('it-IT', {
  maximumFractionDigits: 0,
});
const COORDINATE_FORMATTER = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const TIME_FORMATTER = new Intl.DateTimeFormat('it-IT', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const formatInteger = (value: number | null, suffix = '') =>
  value === null ? 'N/D' : `${NUMBER_FORMATTER.format(value)}${suffix}`;

const formatSpeed = (value: number | null) =>
  value === null ? 'N/D' : `${SPEED_FORMATTER.format(value)} km/h`;

const formatLatitudeLabel = (value: number) =>
  `${Math.abs(value).toFixed(1)}${value >= 0 ? 'N' : 'S'}`;

const formatLongitudeLabel = (value: number) =>
  `${Math.abs(value).toFixed(1)}${value >= 0 ? 'E' : 'W'}`;

const projectGeoPoint = (point: GeoPoint, bounds: GeoBounds) => {
  const [longitude, latitude] = point;

  return {
    x: ((longitude - bounds.lomin) / (bounds.lomax - bounds.lomin)) * VIEWBOX_WIDTH,
    y: ((bounds.lamax - latitude) / (bounds.lamax - bounds.lamin)) * VIEWBOX_HEIGHT,
  };
};

const forEachRingPoint = (geometry: GeoGeometry, callback: (point: GeoPoint) => void) => {
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach((ring) => {
      ring.forEach(callback);
    });

    return;
  }

  geometry.coordinates.forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach(callback);
    });
  });
};

const geometryIntersectsBounds = (geometry: GeoGeometry, bounds: GeoBounds) => {
  let minLongitude = Number.POSITIVE_INFINITY;
  let maxLongitude = Number.NEGATIVE_INFINITY;
  let minLatitude = Number.POSITIVE_INFINITY;
  let maxLatitude = Number.NEGATIVE_INFINITY;

  forEachRingPoint(geometry, ([longitude, latitude]) => {
    minLongitude = Math.min(minLongitude, longitude);
    maxLongitude = Math.max(maxLongitude, longitude);
    minLatitude = Math.min(minLatitude, latitude);
    maxLatitude = Math.max(maxLatitude, latitude);
  });

  return !(
    maxLongitude < bounds.lomin ||
    minLongitude > bounds.lomax ||
    maxLatitude < bounds.lamin ||
    minLatitude > bounds.lamax
  );
};

const ringToPath = (ring: GeoPoint[], bounds: GeoBounds) =>
  ring
    .map((point, index) => {
      const projected = projectGeoPoint(point, bounds);
      return `${index === 0 ? 'M' : 'L'} ${projected.x.toFixed(1)} ${projected.y.toFixed(1)}`;
    })
    .join(' ');

const geometryToSvgPath = (geometry: GeoGeometry, bounds: GeoBounds) => {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => `${ringToPath(ring, bounds)} Z`).join(' ');
  }

  return geometry.coordinates
    .map((polygon) => polygon.map((ring) => `${ringToPath(ring, bounds)} Z`).join(' '))
    .join(' ');
};

const formatLastSeen = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s fa`;
  }

  const minutes = Math.round(seconds / 60);
  return `${minutes} min fa`;
};

const StatCard = ({
  hint,
  label,
  value,
}: {
  hint: string;
  label: string;
  value: string;
}) => (
  <Box
    background="neutral0"
    borderColor="neutral150"
    hasRadius
    padding={6}
    shadow="tableShadow"
    width="100%"
  >
    <Flex alignItems="stretch" direction="column" gap={2}>
      <Typography tag="p" textColor="neutral600" variant="sigma">
        {label}
      </Typography>
      <Typography tag="p" variant="alpha">
        {value}
      </Typography>
      <Typography tag="p" textColor="neutral600" variant="pi">
        {hint}
      </Typography>
    </Flex>
  </Box>
);

const StatusPill = ({ onGround }: { onGround: boolean }) => (
  <Box
    background={onGround ? 'neutral150' : 'success100'}
    hasRadius
    paddingBottom={1}
    paddingLeft={2}
    paddingRight={2}
    paddingTop={1}
  >
    <Typography tag="span" textColor={onGround ? 'neutral700' : 'success700'} variant="pi">
      {onGround ? 'A terra' : 'In volo'}
    </Typography>
  </Box>
);

const FlightMapCard = ({
  flights,
  region,
  selectedFlightId,
  onSelectFlight,
}: {
  flights: Flight[];
  region: SnapshotPayload['region'];
  selectedFlightId: string | null;
  onSelectFlight: (flightId: string) => void;
}) => {
  const basemap = React.useMemo(() => {
    const visibleCountryFeatures = WORLD_COUNTRY_FEATURES.filter(
      (country) => country.geometry && geometryIntersectsBounds(country.geometry, region.bounds)
    );

    return {
      countryPaths: visibleCountryFeatures.map((country, index) => ({
        id: `country-${index}`,
        path: geometryToSvgPath(country.geometry as GeoGeometry, region.bounds),
      })),
      labels: REGION_LABELS[region.key].map((label, index) => ({
        ...projectGeoPoint(label.point, region.bounds),
        id: `label-${index}`,
        text: label.text,
      })),
    };
  }, [region.bounds, region.key]);

  const markers = React.useMemo(
    () =>
      flights.map((flight) => {
        const projected = projectGeoPoint([flight.longitude, flight.latitude], region.bounds);

        return {
          ...flight,
          x: Number.isFinite(projected.x) ? projected.x : 0,
          y: Number.isFinite(projected.y) ? projected.y : 0,
        };
      }),
    [flights, region.bounds.lamax, region.bounds.lamin, region.bounds.lomax, region.bounds.lomin]
  );

  return (
    <Box
      background="neutral0"
      borderColor="neutral150"
      hasRadius
      padding={6}
      shadow="tableShadow"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
      width="100%"
    >
      <Flex
        alignItems="stretch"
        direction="column"
        gap={4}
        style={{ flex: 1, minHeight: 0 }}
      >
        <Flex alignItems="center" justifyContent="space-between" wrap="wrap" gap={2}>
          <Box>
            <Typography tag="h2" variant="delta">
              Mappa live del traffico
            </Typography>
            <Typography tag="p" textColor="neutral600" variant="pi">
              Proiezione su bounding box {region.label.toLowerCase()} con confini geografici reali.
            </Typography>
          </Box>
          <Typography tag="p" textColor="neutral600" variant="pi">
            {markers.length} marker renderizzati
          </Typography>
        </Flex>

        <Box
          background="neutral100"
          borderColor="neutral150"
          hasRadius
          overflow="hidden"
          style={{
            display: 'flex',
            flex: 1,
            minHeight: 'clamp(520px, 68vh, 680px)',
          }}
          width="100%"
        >
          <svg
            aria-label={`Traffico aereo ${region.label}`}
            style={{
              display: 'block',
              flex: 1,
              width: '100%',
              height: '100%',
              background:
                'radial-gradient(circle at top, rgba(73, 69, 255, 0.18), transparent 45%), linear-gradient(180deg, #16213b 0%, #101726 100%)',
            }}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          >
            {Array.from({ length: 7 }, (_, index) => {
              const verticalInset = 40;
              const y = verticalInset + index * ((VIEWBOX_HEIGHT - verticalInset * 2) / 6);
              return (
                <line
                  key={`h-${index}`}
                  x1="0"
                  x2="1000"
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="6 8"
                />
              );
            })}
            {[0, 1, 2, 3, 4, 5, 6].map((index) => {
              const x = 60 + index * 140;
              return (
                <line
                  key={`v-${index}`}
                  x1={x}
                  x2={x}
                  y1="0"
                  y2={VIEWBOX_HEIGHT}
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="6 8"
                />
              );
            })}

            <text fill="rgba(255,255,255,0.55)" fontSize="14" x="18" y="24">
              {formatLatitudeLabel(region.bounds.lamax)}
            </text>
            <text fill="rgba(255,255,255,0.55)" fontSize="14" x="18" y={VIEWBOX_HEIGHT - 14}>
              {formatLatitudeLabel(region.bounds.lamin)}
            </text>
            <text fill="rgba(255,255,255,0.55)" fontSize="14" x="18" y={VIEWBOX_HEIGHT / 2}>
              {formatLongitudeLabel(region.bounds.lomin)} /{' '}
              {formatLongitudeLabel(region.bounds.lomax)}
            </text>

            <g aria-hidden="true">
              {basemap.countryPaths.map((country) => (
                <path
                  key={country.id}
                  d={country.path}
                  fill="rgba(194, 224, 255, 0.10)"
                  stroke="rgba(214, 234, 255, 0.26)"
                  strokeLinejoin="round"
                  strokeWidth="1.3"
                />
              ))}

              {basemap.labels.map((label) => (
                <text
                  key={label.id}
                  fill="rgba(235, 244, 255, 0.44)"
                  fontSize="13"
                  fontWeight="700"
                  letterSpacing="0.12em"
                  textAnchor="middle"
                  x={label.x}
                  y={label.y}
                >
                  {label.text}
                </text>
              ))}
            </g>

            {markers.map((flight) => {
              const isSelected = selectedFlightId === flight.icao24;
              const fill = flight.onGround ? '#9CA3AF' : isSelected ? '#FDE68A' : '#7CFFB6';
              const outline = isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.35)';

              return (
                <g
                  key={flight.icao24}
                  onClick={() => onSelectFlight(flight.icao24)}
                  style={{ cursor: 'pointer' }}
                  transform={`translate(${flight.x}, ${flight.y})`}
                >
                  {isSelected ? (
                    <circle
                      cx="0"
                      cy="0"
                      fill="rgba(125, 211, 252, 0.18)"
                      r="18"
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth="1"
                    />
                  ) : null}
                  <g transform={`rotate(${flight.trueTrack ?? 0})`}>
                    <path
                      d="M -10 0 L 10 -5 L 3 0 L 10 5 Z"
                      fill={fill}
                      stroke={outline}
                      strokeWidth="1.2"
                    />
                  </g>
                  <title>
                    {(flight.callsign ?? flight.icao24).toUpperCase()} - {flight.originCountry}
                  </title>
                </g>
              );
            })}
          </svg>
        </Box>

        <Flex justifyContent="space-between" wrap="wrap" gap={2}>
          <Typography tag="p" textColor="neutral600" variant="pi">
            {region.description} Base map: confini reali dei Paesi da Natural Earth.
          </Typography>
          <Typography tag="p" textColor="neutral600" variant="pi">
            Coordinate: {formatLatitudeLabel(region.bounds.lamin)} /{' '}
            {formatLatitudeLabel(region.bounds.lamax)} lat, {formatLongitudeLabel(region.bounds.lomin)} /{' '}
            {formatLongitudeLabel(region.bounds.lomax)} lon
          </Typography>
        </Flex>
      </Flex>
    </Box>
  );
};

const FlightListCard = ({
  flights,
  selectedFlightId,
  onSelectFlight,
}: {
  flights: Flight[];
  selectedFlightId: string | null;
  onSelectFlight: (flightId: string) => void;
}) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageCount = Math.max(1, Math.ceil(flights.length / FEATURED_FLIGHTS_PAGE_SIZE));

  React.useEffect(() => {
    if (!selectedFlightId) {
      setCurrentPage(0);
      return;
    }

    const selectedIndex = flights.findIndex((flight) => flight.icao24 === selectedFlightId);

    if (selectedIndex === -1) {
      setCurrentPage(0);
      return;
    }

    setCurrentPage(Math.floor(selectedIndex / FEATURED_FLIGHTS_PAGE_SIZE));
  }, [flights, selectedFlightId]);

  const safePage = Math.min(currentPage, pageCount - 1);
  const startIndex = safePage * FEATURED_FLIGHTS_PAGE_SIZE;
  const visibleFlights = flights.slice(startIndex, startIndex + FEATURED_FLIGHTS_PAGE_SIZE);

  return (
  <Box
    background="neutral0"
    borderColor="neutral150"
    hasRadius
    padding={6}
    shadow="tableShadow"
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
    }}
    width="100%"
  >
    <Flex
      alignItems="stretch"
      direction="column"
      gap={4}
      style={{ flex: 1, minHeight: 0 }}
    >
      <Flex alignItems="center" justifyContent="space-between" wrap="wrap" gap={2}>
        <Typography tag="h2" variant="delta">
          Voli in evidenza
        </Typography>
        <Typography tag="p" textColor="neutral600" variant="pi">
          Pagina {safePage + 1} di {pageCount}
        </Typography>
      </Flex>

      <Flex
        alignItems="stretch"
        direction="column"
        gap={3}
        style={{ flex: 1, minHeight: 0 }}
      >
        {visibleFlights.map((flight) => {
          const isSelected = flight.icao24 === selectedFlightId;

          return (
            <Box
              key={flight.icao24}
              as="button"
              background={isSelected ? 'primary100' : 'neutral100'}
              borderColor={isSelected ? 'primary200' : 'neutral150'}
              hasRadius
              onClick={() => onSelectFlight(flight.icao24)}
              padding={5}
              style={{
                appearance: 'none',
                borderStyle: 'solid',
                borderWidth: '1px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              width="100%"
            >
              <Flex alignItems="center" justifyContent="space-between" wrap="wrap" gap={2}>
                <Box>
                  <Typography
                    tag="p"
                    variant="omega"
                    style={{ color: '#FFFFFF', fontWeight: 700 }}
                  >
                    {(flight.callsign ?? flight.icao24).toUpperCase()}
                  </Typography>
                  <Typography tag="p" textColor="neutral600" variant="pi">
                    {flight.originCountry} · ICAO {flight.icao24.toUpperCase()}
                  </Typography>
                </Box>
                <StatusPill onGround={flight.onGround} />
              </Flex>

              <Flex marginTop={3} wrap="wrap" gap={4}>
                <Typography tag="p" textColor="neutral600" variant="pi">
                  Velocita`: {formatSpeed(flight.velocityKmh)}
                </Typography>
                <Typography tag="p" textColor="neutral600" variant="pi">
                  Altitudine: {formatInteger(flight.altitudeMeters, ' m')}
                </Typography>
                <Typography tag="p" textColor="neutral600" variant="pi">
                  Ultimo contatto: {formatLastSeen(flight.lastSeenSecondsAgo)}
                </Typography>
              </Flex>
            </Box>
          );
        })}
      </Flex>

      <Flex alignItems="center" justifyContent="space-between" wrap="wrap" gap={3}>
        <Typography tag="p" textColor="neutral600" variant="pi">
          Mostrati {visibleFlights.length} su {flights.length} voli ordinati per attivita` recente
        </Typography>

        <Flex gap={2}>
          <Button
            disabled={safePage === 0}
            onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
            size="S"
            variant="tertiary"
          >
            Precedenti
          </Button>
          <Button
            disabled={safePage >= pageCount - 1}
            onClick={() => setCurrentPage((page) => Math.min(pageCount - 1, page + 1))}
            size="S"
            variant="tertiary"
          >
            Successivi
          </Button>
        </Flex>
      </Flex>
    </Flex>
  </Box>
  );
};

const FlightDetailsCard = ({ flight }: { flight: Flight | null }) => (
  <Box
    background="neutral0"
    borderColor="neutral150"
    hasRadius
    padding={6}
    shadow="tableShadow"
    width="100%"
  >
    <Flex alignItems="stretch" direction="column" gap={4}>
      <Flex alignItems="center" justifyContent="space-between" wrap="wrap" gap={2}>
        <Typography tag="h2" variant="delta">
          Dettaglio selezione
        </Typography>
        {flight ? <StatusPill onGround={flight.onGround} /> : null}
      </Flex>

      {flight ? (
        <Flex alignItems="stretch" direction="column" gap={3}>
          <Box>
            <Typography tag="p" textColor="neutral0" variant="alpha">
              {(flight.callsign ?? flight.icao24).toUpperCase()}
            </Typography>
            <Typography tag="p" textColor="neutral600" variant="pi">
              {flight.originCountry} · ICAO {flight.icao24.toUpperCase()}
            </Typography>
          </Box>

          <Grid.Root gap={3}>
            <Grid.Item col={6} xs={12} direction="column" alignItems="stretch">
              <Typography tag="p" textColor="neutral600" variant="pi">
                Posizione
              </Typography>
              <Typography tag="p" variant="omega">
                {COORDINATE_FORMATTER.format(flight.latitude)} /{' '}
                {COORDINATE_FORMATTER.format(flight.longitude)}
              </Typography>
            </Grid.Item>
            <Grid.Item col={6} xs={12} direction="column" alignItems="stretch">
              <Typography tag="p" textColor="neutral600" variant="pi">
                Heading
              </Typography>
              <Typography tag="p" variant="omega">
                {flight.trueTrack !== null ? `${flight.trueTrack}°` : 'N/D'}
              </Typography>
            </Grid.Item>
            <Grid.Item col={6} xs={12} direction="column" alignItems="stretch">
              <Typography tag="p" textColor="neutral600" variant="pi">
                Velocita`
              </Typography>
              <Typography tag="p" variant="omega">
                {formatSpeed(flight.velocityKmh)}
              </Typography>
            </Grid.Item>
            <Grid.Item col={6} xs={12} direction="column" alignItems="stretch">
              <Typography tag="p" textColor="neutral600" variant="pi">
                Altitudine
              </Typography>
              <Typography tag="p" variant="omega">
                {formatInteger(flight.altitudeMeters, ' m')}
              </Typography>
            </Grid.Item>
            <Grid.Item col={6} xs={12} direction="column" alignItems="stretch">
              <Typography tag="p" textColor="neutral600" variant="pi">
                Variazione verticale
              </Typography>
              <Typography tag="p" variant="omega">
                {flight.verticalRate !== null
                  ? `${Math.round(flight.verticalRate)} m/s`
                  : 'N/D'}
              </Typography>
            </Grid.Item>
            <Grid.Item col={6} xs={12} direction="column" alignItems="stretch">
              <Typography tag="p" textColor="neutral600" variant="pi">
                Ultimo contatto
              </Typography>
              <Typography tag="p" variant="omega">
                {formatLastSeen(flight.lastSeenSecondsAgo)}
              </Typography>
            </Grid.Item>
          </Grid.Root>
        </Flex>
      ) : (
        <Typography tag="p" textColor="neutral600" variant="pi">
          Nessun velivolo selezionato.
        </Typography>
      )}
    </Flex>
  </Box>
);

const OpenSkyPage = () => {
  const { get } = useFetchClient();
  const [selectedRegion, setSelectedRegion] = React.useState<RegionKey>('italy');
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [snapshot, setSnapshot] = React.useState<SnapshotPayload | null>(null);
  const [selectedFlightId, setSelectedFlightId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRefreshToken((current) => current + 1);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    const loadSnapshot = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const { data } = await get<SnapshotResponse>(
          `/api/open-sky/snapshot?region=${selectedRegion}`,
          {
            signal: controller.signal,
          }
        );

        setSnapshot(data.data);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const apiErrorMessage =
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof error.response === 'object' &&
          error.response !== null &&
          'data' in error.response &&
          typeof error.response.data === 'object' &&
          error.response.data !== null &&
          'error' in error.response.data &&
          typeof error.response.data.error === 'object' &&
          error.response.data.error !== null &&
          'message' in error.response.data.error &&
          typeof error.response.data.error.message === 'string'
            ? error.response.data.error.message
            : null;

        setErrorMessage(
          apiErrorMessage ??
            (error instanceof Error
              ? error.message
              : 'Non sono riuscito a caricare il traffico aereo.')
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadSnapshot();

    return () => controller.abort();
  }, [get, refreshToken, selectedRegion]);

  React.useEffect(() => {
    if (!snapshot?.flights.length) {
      setSelectedFlightId(null);
      return;
    }

    const hasCurrentSelection = snapshot.flights.some((flight) => flight.icao24 === selectedFlightId);

    if (!hasCurrentSelection) {
      setSelectedFlightId(snapshot.flights[0].icao24);
    }
  }, [selectedFlightId, snapshot]);

  const selectedFlight =
    snapshot?.flights.find((flight) => flight.icao24 === selectedFlightId) ?? null;

  if (isLoading && !snapshot) {
    return <Page.Loading />;
  }

  return (
    <Page.Main>
      <Page.Title>OpenSky Dashboard</Page.Title>
      <Layouts.Header
        title="OpenSky: traffico aereo live"
        subtitle="Demo admin con mappa live, tracking di velivoli e proxy backend verso una fonte open data."
      />
      <Layouts.Content>
        <Flex alignItems="stretch" direction="column" gap={6}>
          <Box
            background="neutral0"
            borderColor="neutral150"
            hasRadius
            padding={4}
            shadow="tableShadow"
          >
            <Flex alignItems="stretch" direction="column" gap={3}>
              <Typography tag="p" textColor="neutral600" variant="pi">
                Seleziona l&apos;area da monitorare. I dati vengono aggiornati automaticamente ogni 20
                secondi.
              </Typography>

              <Grid.Root gap={2}>
                {REGION_OPTIONS.map((option) => (
                  <Grid.Item
                    key={option.key}
                    col={4}
                    s={4}
                    xs={12}
                    direction="column"
                    alignItems="stretch"
                  >
                    <Button
                      fullWidth
                      onClick={() => {
                        React.startTransition(() => {
                          setSelectedRegion(option.key);
                        });
                      }}
                      size="S"
                      variant={selectedRegion === option.key ? undefined : 'tertiary'}
                    >
                      {option.label}
                    </Button>
                  </Grid.Item>
                ))}
              </Grid.Root>

              <Flex alignItems="center" justifyContent="space-between" wrap="wrap" gap={3}>
                <Typography tag="p" textColor="neutral600" variant="pi">
                  Fonte attiva: {snapshot?.source ?? 'OpenSky Network'} · feed ADS-B comunitario open
                  source
                </Typography>
                <Button
                  onClick={() => setRefreshToken((current) => current + 1)}
                  size="S"
                  variant="tertiary"
                >
                  Aggiorna ora
                </Button>
              </Flex>
            </Flex>
          </Box>

          {errorMessage ? (
            <Box
              background="danger100"
              borderColor="danger200"
              hasRadius
              padding={4}
              shadow="filterShadow"
            >
              <Typography tag="p" textColor="danger700">
                {errorMessage}
              </Typography>
            </Box>
          ) : null}

          {snapshot ? (
            <>
              <Grid.Root gap={4}>
                <Grid.Item col={3} m={6} xs={12} direction="column" alignItems="stretch">
                  <StatCard
                    hint={`Mostrati ${snapshot.totals.rendered} su ${snapshot.totals.tracked} rilevati`}
                    label="Velivoli osservati"
                    value={formatInteger(snapshot.totals.tracked)}
                  />
                </Grid.Item>
                <Grid.Item col={3} m={6} xs={12} direction="column" alignItems="stretch">
                  <StatCard
                    hint={`${snapshot.totals.onGround} a terra nella stessa area`}
                    label="In volo"
                    value={formatInteger(snapshot.totals.airborne)}
                  />
                </Grid.Item>
                <Grid.Item col={3} m={6} xs={12} direction="column" alignItems="stretch">
                  <StatCard
                    hint="Media sugli aeromobili non a terra"
                    label="Altitudine media"
                    value={formatInteger(snapshot.totals.averageAltitudeMeters, ' m')}
                  />
                </Grid.Item>
                <Grid.Item col={3} m={6} xs={12} direction="column" alignItems="stretch">
                  <StatCard
                    hint={`Ultimo snapshot: ${TIME_FORMATTER.format(new Date(snapshot.fetchedAt))}`}
                    label="Velivolo piu` veloce"
                    value={formatSpeed(snapshot.totals.fastestVelocityKmh)}
                  />
                </Grid.Item>
              </Grid.Root>

              <Grid.Root gap={4} style={{ alignItems: 'stretch', marginBottom: '24px' }}>
                <Grid.Item
                  col={8}
                  xs={12}
                  direction="column"
                  alignItems="stretch"
                  style={{ display: 'flex' }}
                >
                  <FlightMapCard
                    flights={snapshot.flights}
                    onSelectFlight={setSelectedFlightId}
                    region={snapshot.region}
                    selectedFlightId={selectedFlightId}
                  />
                </Grid.Item>
                <Grid.Item
                  col={4}
                  xs={12}
                  direction="column"
                  alignItems="stretch"
                  style={{ display: 'flex' }}
                >
                  <Flex
                    alignItems="stretch"
                    direction="column"
                    gap={4}
                    style={{ height: '100%', minHeight: 0 }}
                  >
                    <FlightDetailsCard flight={selectedFlight} />
                    <Box style={{ flex: 1, minHeight: 0 }}>
                      <FlightListCard
                        flights={snapshot.flights}
                        onSelectFlight={setSelectedFlightId}
                        selectedFlightId={selectedFlightId}
                      />
                    </Box>
                  </Flex>
                </Grid.Item>
              </Grid.Root>
            </>
          ) : null}

          {isLoading ? (
            <Typography tag="p" textColor="neutral600" variant="pi">
              Aggiornamento snapshot in corso...
            </Typography>
          ) : null}
        </Flex>
      </Layouts.Content>
    </Page.Main>
  );
};

const ProtectedOpenSkyPage = () => (
  <Page.Protect permissions={OPEN_SKY_READ_PERMISSIONS}>
    <OpenSkyPage />
  </Page.Protect>
);

export default ProtectedOpenSkyPage;
