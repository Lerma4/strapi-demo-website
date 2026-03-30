import * as React from 'react';

import { Box, Button, Flex, Grid, Typography } from '@strapi/design-system';
import { Layouts, Page } from '@strapi/strapi/admin';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { FRANKFURTER_READ_PERMISSIONS } from '../../frankfurter-permissions';

type FrankfurterRate = {
  base: string;
  date: string;
  quote: string;
  rate: number;
};

type DashboardData = {
  latest: FrankfurterRate | null;
  series: FrankfurterRate[];
};

type ChartDatum = FrankfurterRate & {
  fullDate: string;
  shortDate: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WINDOW_OPTIONS = [7, 30, 90];
const CURRENCY_FORMATTER = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});
const PERCENT_FORMATTER = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const DATE_FORMATTER = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
});
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const formatApiDate = (date: Date) => date.toISOString().slice(0, 10);
const formatDisplayDate = (date: string) => LONG_DATE_FORMATTER.format(new Date(date));

const getDateRange = (days: number) => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days - 1) * DAY_IN_MS);

  return {
    from: formatApiDate(startDate),
    to: formatApiDate(endDate),
  };
};

const buildFrankfurterUrl = (params: Record<string, string>) => {
  const url = new URL('https://api.frankfurter.dev/v2/rates');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

const StatCard = ({
  label,
  value,
  hint,
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

const ChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const datum = payload[0].payload;

  return (
    <Box
      background="neutral0"
      borderColor="neutral200"
      hasRadius
      padding={3}
      shadow="filterShadow"
    >
      <Flex alignItems="stretch" direction="column" gap={1}>
        <Typography tag="p" variant="omega">
          {CURRENCY_FORMATTER.format(datum.rate)}
        </Typography>
        <Typography tag="p" textColor="neutral600" variant="pi">
          {datum.fullDate}
        </Typography>
      </Flex>
    </Box>
  );
};

const ChartCard = ({ series }: { series: FrankfurterRate[] }) => {
  const chartData = React.useMemo<ChartDatum[]>(
    () =>
      series.map((entry) => ({
        ...entry,
        fullDate: formatDisplayDate(entry.date),
        shortDate: DATE_FORMATTER.format(new Date(entry.date)),
      })),
    [series]
  );

  return (
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
            Andamento EUR/USD
          </Typography>
          <Typography tag="p" textColor="neutral600" variant="pi">
            Ultime {series.length} rilevazioni giornaliere da ECB via Frankfurter
          </Typography>
        </Flex>

        <Box
          background="neutral100"
          borderColor="neutral150"
          hasRadius
          padding={4}
          width="100%"
        >
          <Box height="260px" width="100%">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 12, bottom: 8, left: -28 }}>
                <CartesianGrid stroke="#4A4A6A" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="shortDate"
                  minTickGap={32}
                  tick={{ fill: '#A5A5BA', fontSize: 12 }}
                  tickLine={false}
                  tickMargin={12}
                />
                <YAxis
                  axisLine={false}
                  domain={['dataMin - 0.002', 'dataMax + 0.002']}
                  hide
                  tickLine={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: '#8E8EA9', strokeDasharray: '4 4', strokeWidth: 1 }}
                />
                <Line
                  activeDot={{ fill: '#4945FF', r: 3.5, stroke: '#C9C7FF', strokeWidth: 1.5 }}
                  dataKey="rate"
                  dot={false}
                  stroke="#5B58FF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.65}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Flex justifyContent="space-between" wrap="wrap" gap={2}>
          <Typography tag="p" textColor="neutral600" variant="pi">
            {series[0] ? DATE_FORMATTER.format(new Date(series[0].date)) : 'N/D'}
          </Typography>
          <Typography tag="p" textColor="neutral600" variant="pi">
            {series.at(-1) ? DATE_FORMATTER.format(new Date(series.at(-1)!.date)) : 'N/D'}
          </Typography>
        </Flex>
      </Flex>
    </Box>
  );
};

const FrankfurterPage = () => {
  const [selectedWindow, setSelectedWindow] = React.useState(30);
  const [data, setData] = React.useState<DashboardData>({
    latest: null,
    series: [],
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    const controller = new AbortController();
    const { from, to } = getDateRange(selectedWindow);

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const [latestResponse, seriesResponse] = await Promise.all([
          fetch(
            buildFrankfurterUrl({
              base: 'EUR',
              quotes: 'USD',
              providers: 'ECB',
            }),
            { signal: controller.signal }
          ),
          fetch(
            buildFrankfurterUrl({
              from,
              to,
              base: 'EUR',
              quotes: 'USD',
              providers: 'ECB',
            }),
            { signal: controller.signal }
          ),
        ]);

        if (!latestResponse.ok || !seriesResponse.ok) {
          throw new Error('La risposta di Frankfurter non e` valida.');
        }

        const latestPayload = (await latestResponse.json()) as FrankfurterRate[];
        const seriesPayload = (await seriesResponse.json()) as FrankfurterRate[];
        const sortedSeries = [...seriesPayload].sort((left, right) => left.date.localeCompare(right.date));

        setData({
          latest: latestPayload[0] ?? sortedSeries.at(-1) ?? null,
          series: sortedSeries,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Non sono riuscito a recuperare i dati del cambio.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => controller.abort();
  }, [selectedWindow]);

  const stats = React.useMemo(() => {
    const values = data.series.map((entry) => entry.rate);
    const first = values[0];
    const last = data.latest?.rate ?? values.at(-1);
    const min = values.length > 0 ? Math.min(...values) : null;
    const max = values.length > 0 ? Math.max(...values) : null;
    const change = first && last ? ((last - first) / first) * 100 : null;

    return {
      change,
      firstDate: data.series[0]?.date ?? '',
      latestDate: data.latest?.date ?? data.series.at(-1)?.date ?? '',
      max,
      min,
      observations: data.series.length,
    };
  }, [data.latest, data.series]);

  if (isLoading && data.series.length === 0) {
    return <Page.Loading />;
  }

  return (
    <Page.Main>
      <Page.Title>Frankfurter Dashboard</Page.Title>
      <Layouts.Header
        title="Frankfurter: EUR/USD"
        subtitle="Demo di integrazione esterna nel backoffice con dati aperti e grafico storico."
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
                Seleziona la finestra temporale del grafico.
              </Typography>

              <Grid.Root gap={2}>
                {WINDOW_OPTIONS.map((windowSize) => (
                  <Grid.Item
                    key={windowSize}
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
                        setSelectedWindow(windowSize);
                      });
                    }}
                    size="S"
                    variant={selectedWindow === windowSize ? undefined : 'tertiary'}
                  >
                    {windowSize} giorni
                  </Button>
                  </Grid.Item>
                ))}
              </Grid.Root>

              <Typography tag="p" textColor="neutral600" variant="pi">
                Fonte attiva: European Central Bank via Frankfurter
              </Typography>
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

          <Grid.Root gap={4}>
            <Grid.Item col={3} m={6} xs={12} direction="column" alignItems="stretch">
              <StatCard
                hint={
                  stats.latestDate
                    ? `Ultimo aggiornamento: ${formatDisplayDate(stats.latestDate)}`
                    : 'Dato disponibile'
                }
                label="Cambio attuale"
                value={data.latest ? CURRENCY_FORMATTER.format(data.latest.rate) : 'N/D'}
              />
            </Grid.Item>
            <Grid.Item col={3} m={6} xs={12} direction="column" alignItems="stretch">
              <StatCard
                hint={`Su ${stats.observations} rilevazioni`}
                label="Performance periodo"
                value={
                  stats.change !== null
                    ? `${stats.change >= 0 ? '+' : ''}${PERCENT_FORMATTER.format(stats.change)}%`
                    : 'N/D'
                }
              />
            </Grid.Item>
            <Grid.Item col={3} m={6} xs={12} direction="column" alignItems="stretch">
              <StatCard
                hint={stats.firstDate ? `Dal ${formatDisplayDate(stats.firstDate)}` : 'Periodo corrente'}
                label="Minimo"
                value={stats.min !== null ? CURRENCY_FORMATTER.format(stats.min) : 'N/D'}
              />
            </Grid.Item>
            <Grid.Item col={3} m={6} xs={12} direction="column" alignItems="stretch">
              <StatCard
                hint={stats.latestDate ? `Al ${formatDisplayDate(stats.latestDate)}` : 'Periodo corrente'}
                label="Massimo"
                value={stats.max !== null ? CURRENCY_FORMATTER.format(stats.max) : 'N/D'}
              />
            </Grid.Item>

            <Grid.Item col={12} xs={12} direction="column" alignItems="stretch">
              <ChartCard series={data.series} />
            </Grid.Item>
          </Grid.Root>

          {isLoading ? (
            <Typography tag="p" textColor="neutral600" variant="pi">
              Aggiornamento dati in corso...
            </Typography>
          ) : null}
        </Flex>
      </Layouts.Content>
    </Page.Main>
  );
};

const ProtectedFrankfurterPage = () => (
  <Page.Protect permissions={FRANKFURTER_READ_PERMISSIONS}>
    <FrankfurterPage />
  </Page.Protect>
);

export default ProtectedFrankfurterPage;
