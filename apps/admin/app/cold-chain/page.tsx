'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Button,
  StatusPip,
  TelemetryCard,
  StatusBadge,
  DataTable,
  ClinicalModal,
  type DataTableColumn,
} from '@mirage/ui';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Zap,
  MapPin,
  ShieldAlert,
  RefreshCw,
  Thermometer,
  Radio,
  FileCheck2,
  Layers,
  Activity,
} from 'lucide-react';
import {
  MOCK_COLD_CHAIN_DEPOTS,
  MOCK_DEPOT_BATCHES,
  type ColdChainDepot,
  type DepotBatch,
} from '@mirage/types';

export default function ColdChainTelemetryPage() {
  const [depots, setDepots] = useState<ColdChainDepot[]>(MOCK_COLD_CHAIN_DEPOTS);
  const [batches, setBatches] = useState<DepotBatch[]>(MOCK_DEPOT_BATCHES);
  const [selectedDepotId, setSelectedDepotId] = useState<string>(
    MOCK_COLD_CHAIN_DEPOTS[0]?.id ?? 'depot-cai-01'
  );
  const [liveStreamActive, setLiveStreamActive] = useState(true);
  const [capaModalOpen, setCapaModalOpen] = useState(false);
  const [investigatorName, setInvestigatorName] = useState('Eng. Karim Hassan');
  const [capaJustification, setCapaJustification] = useState(
    'Cryo-compressor valve #2 recalibrated; liquid nitrogen backup activated. Thermal stability verified within +2°C to +8°C.'
  );
  const [ackBannerMessage, setAckBannerMessage] = useState<string | null>(null);

  const selectedDepot = useMemo(() => {
    return depots.find((d) => d.id === selectedDepotId) ?? depots[0];
  }, [depots, selectedDepotId]);

  // Live IoT telemetry jitter simulation (sub-degree natural fluctuations)
  useEffect(() => {
    if (!liveStreamActive) return;
    const interval = setInterval(() => {
      setDepots((prev) =>
        prev.map((d) => {
          if (d.status === 'critical') return d; // Keep critical until sign-off
          const jitter = (Math.random() - 0.5) * 0.15;
          const nextTemp = Math.max(2.1, Math.min(7.9, +(d.currentTempCelsius + jitter).toFixed(1)));
          return {
            ...d,
            currentTempCelsius: nextTemp,
            hourlyReadings: [...d.hourlyReadings.slice(1), nextTemp],
          };
        })
      );
    }, 4500);
    return () => clearInterval(interval);
  }, [liveStreamActive]);

  const triggerExcursionSimulation = () => {
    if (!selectedDepot) return;
    setDepots((prev) =>
      prev.map((d) =>
        d.id === selectedDepot.id
          ? {
              ...d,
              currentTempCelsius: 9.4,
              status: 'critical',
              powerSource: 'Cryo-Generator Backup',
              hourlyReadings: [...d.hourlyReadings.slice(1), 9.4],
            }
          : d
      )
    );
    // Quarantine batches inside the breached depot
    setBatches((prev) =>
      prev.map((b) =>
        b.depotId === selectedDepot.id
          ? { ...b, quarantineStatus: 'Quarantine Lock' }
          : b
      )
    );
    setAckBannerMessage(null);
  };

  const handleCapaSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepot) return;

    setDepots((prev) =>
      prev.map((d) =>
        d.id === selectedDepot.id
          ? {
              ...d,
              currentTempCelsius: 4.4,
              status: 'optimal',
              powerSource: 'Grid Primary',
              hourlyReadings: [...d.hourlyReadings.slice(1), 4.4],
            }
          : d
      )
    );

    // Release quarantined batches
    setBatches((prev) =>
      prev.map((b) =>
        b.depotId === selectedDepot.id
          ? { ...b, quarantineStatus: 'Released' }
          : b
      )
    );

    setCapaModalOpen(false);
    setAckBannerMessage(
      `Signed 21 CFR Part 11 CAPA by ${investigatorName} for ${selectedDepot.code}. Temperature stabilized at +4.4°C and ${selectedDepot.activeBatches} batches cleared.`
    );
  };

  const batchColumns: DataTableColumn<DepotBatch>[] = [
    {
      key: 'batchNumber',
      header: 'Lot / Batch Number',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-xs text-brand-navy">
          {row.batchNumber}
        </span>
      ),
    },
    {
      key: 'productName',
      header: 'Formulation Line',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-xs text-brand-navy">
          {row.productName}
        </span>
      ),
    },
    {
      key: 'depotCode',
      header: 'Storage Depot',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-brand-navy">
          {row.depotCode}
        </span>
      ),
    },
    {
      key: 'packSize',
      header: 'Pack Size',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">
          {row.packSize}
        </span>
      ),
    },
    {
      key: 'unitsCount',
      header: 'Units Stored',
      sortable: true,
      align: 'right',
      csvValue: (row) => row.unitsCount,
      render: (row) => (
        <span className="font-mono font-bold text-xs text-brand-primary tabular-numbers">
          {row.unitsCount.toLocaleString()} units
        </span>
      ),
    },
    {
      key: 'quarantineStatus',
      header: 'GxP QA Clearance',
      sortable: true,
      render: (row) => (
        <StatusBadge
          variant={
            row.quarantineStatus === 'Released'
              ? 'in-spec'
              : row.quarantineStatus === 'Quarantine Lock'
              ? 'excursion'
              : 'caution'
          }
          size="xs"
          pulse={row.quarantineStatus === 'Quarantine Lock'}
        >
          {row.quarantineStatus}
        </StatusBadge>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Expiration',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.expiryDate}
        </span>
      ),
    },
  ];

  const meanTemp = useMemo(() => {
    const sum = depots.reduce((acc, d) => acc + d.currentTempCelsius, 0);
    return (sum / depots.length).toFixed(1);
  }, [depots]);

  const totalUnits = useMemo(() => {
    return batches.reduce((acc, b) => acc + b.unitsCount, 0);
  }, [batches]);

  return (
    <div className="space-y-6">
      {/* Phase 4 Header */}
      <div className="hud-glass p-6 rounded-3xl border border-white/80 shadow-hud-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge variant="regulatory" size="sm" pulse code="TELEMETRY">
              Cold-Chain Cryo-Depot IoT Telemetry
            </StatusBadge>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Simulation Stream
            </span>
            <StatusPip
              status={
                depots.some((d) => d.status === 'critical')
                  ? 'warning'
                  : 'optimal'
              }
              label="WHO TRS 961 Thermal Compliance Stream"
            />
          </div>
          <h1 className="font-heading font-black text-2xl text-brand-navy">
            Cryo-Depot IoT Telemetry & Thermal Excursion Hub
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Continuous temperature & relative humidity sensor telemetry across Cairo, Alexandria, Giza, and Asyut refrigerated distribution centers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setLiveStreamActive((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
              liveStreamActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>IoT Stream: {liveStreamActive ? 'LIVE (4.5s)' : 'PAUSED'}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={triggerExcursionSimulation}
          >
            <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600" />
            Simulate Thermal Excursion (+9.4°C)
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCapaModalOpen(true)}
          >
            <FileCheck2 className="w-4 h-4 mr-1.5" />
            Sign 21 CFR Part 11 CAPA
          </Button>
        </div>
      </div>

      {/* Excursion Alert Banner if any depot is critical */}
      {selectedDepot?.status === 'critical' ? (
        <div className="p-5 rounded-3xl bg-rose-950 text-white border-2 border-rose-500 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-300 font-bold block">
                CRITICAL GxP THERMAL EXCURSION DETECTED • 21 CFR PART 11 SIGN-OFF REQUIRED
              </span>
              <h2 className="font-heading font-extrabold text-lg text-white">
                {selectedDepot.code} ({selectedDepot.location}) breached +8.0°C Upper Limit (Current: +{selectedDepot.currentTempCelsius.toFixed(1)}°C)
              </h2>
              <p className="text-xs text-rose-200 mt-0.5">
                {selectedDepot.activeBatches} commercial lots placed on automatic Quarantine Lock pending electronic QA sign-off.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCapaModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Sign Electronic CAPA & Restore +4.4°C
            </Button>
          </div>
        </div>
      ) : null}

      {ackBannerMessage ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {ackBannerMessage}
          </span>
          <button
            type="button"
            onClick={() => setAckBannerMessage(null)}
            className="text-emerald-700 font-mono text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Cold-Chain KPI Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TelemetryCard
          label="Mean Network Temperature"
          value={`+${meanTemp}°C`}
          subtitle="4 Monitored Regional Depots"
          delta={Number(meanTemp) > 6 ? 'Pre-Warn' : 'Optimal'}
          targetSpec="+2.0°C to +8.0°C"
          status={Number(meanTemp) > 6 ? 'warning' : 'optimal'}
          sparkline={[4.2, 4.3, 4.5, 4.6, 4.8, Number(meanTemp)]}
          icon={<Thermometer className="w-4 h-4" />}
        />
        <TelemetryCard
          label="Active Cryo-Depots"
          value={`${depots.length} Nodes`}
          subtitle="Cairo, Alex, Giza, Asyut"
          delta="100% Online"
          targetSpec="Dual UPS Redundant"
          status="optimal"
          sparkline={[4, 4, 4, 4, 4]}
          icon={<Activity className="w-4 h-4" />}
        />
        <TelemetryCard
          label="Refrigerated Inventory"
          value={`${totalUnits.toLocaleString()}`}
          subtitle="Finished Packaged Dosage Units"
          delta="Quarantine Managed"
          targetSpec="EDA Regulated"
          status="nominal"
          sparkline={[18000, 19500, 21000, 22400, totalUnits]}
          icon={<Layers className="w-4 h-4" />}
        />
        <TelemetryCard
          label="Sensor NIST Calibration"
          value="100% In-Spec"
          subtitle="Annual ISO 17025 Verification"
          delta="Calibrated"
          targetSpec="NIST Traceable"
          status="optimal"
          sparkline={[100, 100, 100, 100, 100]}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
      </div>

      {/* 4 Depot Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {depots.map((depot) => {
          const isSelected = selectedDepot?.id === depot.id;
          const badgeVariant =
            depot.status === 'critical'
              ? 'excursion'
              : depot.status === 'warning'
              ? 'caution'
              : 'in-spec';

          return (
            <button
              key={depot.id}
              type="button"
              onClick={() => setSelectedDepotId(depot.id)}
              className={`text-left p-5 rounded-3xl border transition-all space-y-4 ${
                isSelected
                  ? 'bg-white border-brand-primary ring-2 ring-brand-primary/15 shadow-md'
                  : 'bg-white/85 border-slate-200/80 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-brand-navy text-white font-mono text-[10px] font-bold">
                  {depot.code}
                </span>
                <StatusBadge
                  variant={badgeVariant}
                  size="xs"
                  pulse={depot.status === 'critical'}
                >
                  {depot.status === 'critical'
                    ? 'Excursion Alert'
                    : depot.status === 'warning'
                    ? 'Pre-Alarm Drift'
                    : 'In-Spec Optimal'}
                </StatusBadge>
              </div>

              <div>
                <h3 className="font-heading font-bold text-sm text-brand-navy line-clamp-1">
                  {depot.location}
                </h3>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-brand-primary" />
                  {depot.region} ({depot.gpsCoordinates.lat.toFixed(2)}°N, {depot.gpsCoordinates.lng.toFixed(2)}°E)
                </span>
              </div>

              <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Core Sensor Temp
                  </span>
                  <span
                    className={`font-heading font-black text-3xl tabular-numbers ${
                      depot.status === 'critical'
                        ? 'text-rose-600'
                        : depot.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-brand-primary'
                    }`}
                  >
                    +{depot.currentTempCelsius.toFixed(1)}°C
                  </span>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-500">
                  <div>RH: {depot.humidityPercent}%</div>
                  <div>{depot.activeBatches} Batches</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Depot High-Precision 12-Hour Continuous Thermal Telemetry Graph */}
      {selectedDepot ? (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-primary">
                  {selectedDepot.code}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-mono text-slate-500">
                  Last NIST Calibration: {selectedDepot.lastCalibrationDate}
                </span>
              </div>
              <h2 className="font-heading font-bold text-lg text-brand-navy mt-0.5">
                {selectedDepot.location} — Continuous Thermal Fluctuation Curve
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Droplets className="w-4 h-4 text-sky-500" />
                Humidity: <strong>{selectedDepot.humidityPercent}% RH</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <Zap className="w-4 h-4 text-amber-500" />
                Power: <strong>{selectedDepot.powerSource}</strong>
              </span>
            </div>
          </div>

          {/* SVG Telemetry Chart */}
          <div className="p-5 rounded-2xl bg-[#020F24] text-white space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-rose-400 font-bold">UPPER EXCURSION LIMIT: +8.0°C</span>
              <span className="text-[#61C0E4] font-bold">
                LIVE PROBE: +{selectedDepot.currentTempCelsius.toFixed(1)}°C
              </span>
              <span className="text-sky-400 font-bold">LOWER FREEZE LIMIT: +2.0°C</span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                viewBox="0 0 720 200"
                className="w-full h-48 overflow-visible"
              >
                {/* Upper Limit +8.0C Line */}
                <line
                  x1="0"
                  y1="35"
                  x2="720"
                  y2="35"
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                {/* Optimal +5.0C Midline */}
                <line
                  x1="0"
                  y1="100"
                  x2="720"
                  y2="100"
                  stroke="#308995"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
                {/* Lower Limit +2.0C Line */}
                <line
                  x1="0"
                  y1="165"
                  x2="720"
                  y2="165"
                  stroke="#38BDF8"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />

                {/* Plot Polyline */}
                <polyline
                  fill="none"
                  stroke={
                    selectedDepot.status === 'critical'
                      ? '#F43F5E'
                      : selectedDepot.status === 'warning'
                      ? '#F59E0B'
                      : '#61C0E4'
                  }
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={selectedDepot.hourlyReadings
                    .map((temp, idx) => {
                      const x =
                        (idx / (selectedDepot.hourlyReadings.length - 1)) * 680 +
                        20;
                      const y = 190 - (temp / 10) * 180;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ')}
                />

                {/* Data Points */}
                {selectedDepot.hourlyReadings.map((temp, idx) => {
                  const x =
                    (idx / (selectedDepot.hourlyReadings.length - 1)) * 680 + 20;
                  const y = 190 - (temp / 10) * 180;
                  return (
                    <g key={idx}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill={temp > 8 ? '#F43F5E' : '#020F24'}
                        stroke="#61C0E4"
                        strokeWidth="2.5"
                      />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="#E2E8F0"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        +{temp.toFixed(1)}°
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      ) : null}

      {/* Depot Stored Batches Table (Phase 02 DataTable) */}
      <DataTable
        title="Refrigerated Batch Inventory & Quarantine Ledger"
        subtitle="Active commercial formulation lots stored across regional cryo-depots. Excursions automatically enforce GxP Quarantine Locks."
        data={batches}
        columns={batchColumns}
        rowKey={(row) => row.id}
        searchableKeys={['batchNumber', 'productName', 'depotCode', 'quarantineStatus']}
        exportFileName="mirage-cold-chain-batches-manifest.csv"
      />

      {/* 21 CFR Part 11 Electronic CAPA Sign-Off Modal */}
      <ClinicalModal
        open={capaModalOpen}
        onClose={() => setCapaModalOpen(false)}
        title="21 CFR Part 11 Electronic Investigator CAPA Sign-Off"
        subtitle={`Depot Node: ${selectedDepot?.code} (${selectedDepot?.location})`}
        gxpBadge="INVESTIGATOR THERMAL SIGN-OFF"
      >
        <form onSubmit={handleCapaSignOff} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
            <span className="font-bold block">
              FDA 21 CFR Part 11 Electronic Signature Notice
            </span>
            <p className="leading-relaxed">
              By executing this digital signature, you certify under penalty of law that the corrective and preventive action (CAPA) described below has been verified and liquid nitrogen cooling has restored the storage facility to the mandatory +2.0°C to +8.0°C range.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
              Authorized QA / GxP Investigator Name *
            </label>
            <input
              type="text"
              required
              value={investigatorName}
              onChange={(e) => setInvestigatorName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-semibold"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
              CAPA Root Cause & Corrective Action Justification *
            </label>
            <textarea
              required
              rows={3}
              value={capaJustification}
              onChange={(e) => setCapaJustification(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCapaModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Execute Electronic Sign-Off & Restore +4.4°C
            </Button>
          </div>
        </form>
      </ClinicalModal>
    </div>
  );
}
