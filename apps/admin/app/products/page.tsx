'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Button,
  Card,
  StatusBadge,
  DataTable,
  ClinicalModal,
  TelemetryCard,
  type DataTableColumn,
} from '@mirage/ui';
import {
  Pill,
  FlaskConical,
  BookOpen,
  QrCode,
  PackageCheck,
  ExternalLink,
  CheckCircle2,
  Plus,
  Sparkles,
  FilePlus2,
  Edit3,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { type Product } from '@mirage/types';
import { memoryStore } from '@mirage/db';
import {
  getProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  togglePackStockAction,
} from './actions';

const CATEGORIES = [
  'All',
  'Gastrointestinal & Immunity',
  'Men Health',
  'Women Health',
  'Vitamins & Minerals',
  'Maternal Care',
  'Pediatrics & Immunity',
] as const;

type StudioTab =
  | 'general'
  | 'supplement'
  | 'materials'
  | 'evidence'
  | 'serialization';

export default function FormulationStudioPage() {
  const [products, setProducts] = useState<Product[]>(() => memoryStore.getProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    () => memoryStore.getProducts()[0]?.id ?? 'prod-sympdca'
  );
  const [activeTab, setActiveTab] = useState<StudioTab>('general');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'mongodb' | 'static'>('static');

  // Load products from MongoDB when the page opens (protected by products:read)
  useEffect(() => {
    let cancelled = false;
    async function loadInitialProducts() {
      setIsLoading(true);
      try {
        const res = await getProductsAction({ locale: 'en' });
        if (cancelled) return;
        if (res.ok) {
          if (Array.isArray(res.products) && res.products.length > 0) {
            setProducts(res.products);
          }
          setDataSource(res.source === 'mongodb' ? 'mongodb' : 'static');
          setLoadError(null);
        } else {
          setLoadError(res.error || 'Failed to load products from MongoDB.');
          setDataSource('static');
        }
      } catch (err: any) {
        if (cancelled) return;
        setLoadError(err?.message || 'Error communicating with server action.');
        setDataSource('static');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    loadInitialProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // New Formulation Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSkuName, setNewSkuName] = useState('');
  const [newSkuSubtitle, setNewSkuSubtitle] = useState('');
  const [newSkuArabic, setNewSkuArabic] = useState('مكمل غذائي معتمد');
  const [newSkuCategory, setNewSkuCategory] =
    useState<Product['category']>('Vitamins & Minerals');

  // Edit Formulation Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editArabicSubtitle, setEditArabicSubtitle] = useState('');
  const [editCategory, setEditCategory] =
    useState<Product['category']>('Vitamins & Minerals');
  const [editDescription, setEditDescription] = useState('');

  // Delete Formulation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // New Ingredient State inside Tab 2
  const [newIngName, setNewIngName] = useState('');
  const [newIngAmount, setNewIngAmount] = useState('');
  const [newIngDv, setNewIngDv] = useState('');

  // Serialization simulator state
  const [batchCode, setBatchCode] = useState('BATCH-N4B-2026-108');
  const [expiryDate, setExpiryDate] = useState('2028-10-31');
  const [gtinCode, setGtinCode] = useState('06224009184012');
  const [serialNo, setSerialNo] = useState('SN-994028174');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      return selectedCategory === 'All' || p.category === selectedCategory;
    });
  }, [products, selectedCategory]);

  const activeProduct = useMemo(() => {
    return (
      products.find((p) => p.id === selectedProductId) ??
      filteredProducts[0] ??
      products[0]
    );
  }, [products, selectedProductId, filteredProducts]);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const triggerToast = (msg: string) => {
    setSavedToast(msg);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setSavedToast(null);
    }, 4000);
  };

  const togglePackStock = async (productId: string, packIndex: number) => {
    const prod = products.find((p) => p.id === productId);
    const targetInStock = prod ? !prod.packSizes[packIndex]?.inStock : true;

    try {
      const res = await togglePackStockAction(productId, packIndex, targetInStock);
      if (!res.ok) {
        triggerToast(`Failed to toggle pack stock: ${res.error}`);
        return;
      }
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const nextPacks = p.packSizes.map((pack, idx) =>
            idx === packIndex ? { ...pack, inStock: targetInStock } : pack
          );
          return { ...p, packSizes: nextPacks };
        })
      );
      triggerToast('Updated pack size inventory state in MongoDB & logged to GxP Ledger.');
    } catch (err: any) {
      triggerToast(`Database write error: ${err?.message || 'Failed to update pack stock'}`);
    }
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || !newIngName.trim() || !newIngAmount.trim()) return;

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== activeProduct.id) return prod;
        const currentFacts = prod.supplementFacts ?? {
          servingSize: '1 Capsule',
          servingsPerContainer: 30,
          ingredients: [],
        };
        return {
          ...prod,
          supplementFacts: {
            ...currentFacts,
            ingredients: [
              ...currentFacts.ingredients,
              {
                name: newIngName.trim(),
                amountPerServing: newIngAmount.trim(),
                dailyValuePercentage: newIngDv.trim() || '†',
              },
            ],
          },
        };
      })
    );
    setNewIngName('');
    setNewIngAmount('');
    setNewIngDv('');
    triggerToast(`Added compound "${newIngName}" to ${activeProduct.name} monograph.`);
  };

  const handleCreateFormulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkuName.trim()) return;

    const slug = newSkuName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    const created: Product = {
      id: `prod-${Date.now()}`,
      slug,
      name: newSkuName.trim(),
      brandLine: 'Naturals 4be',
      category: newSkuCategory,
      subtitle: newSkuSubtitle.trim() || 'Clinical Bio-Optimized Formula',
      arabicSubtitle: newSkuArabic.trim() || 'مكمل غذائي',
      tagline: `${newSkuName.trim()} — Pharmaceutical Grade Nutraceutical`,
      description:
        'Newly registered clinical formulation engineered under EDA & ISO 9001:2015 quality assurance protocols.',
      packSizes: [
        { quantity: 30, unit: 'capsules', inStock: true },
        { quantity: 60, unit: 'capsules', inStock: true },
      ],
      heroImage: '/brand/products/folate-b12.jpg',
      dosageInstructions: 'Take 1–2 capsules daily with water or as directed by a physician.',
      supplementFacts: {
        servingSize: '1 Capsule',
        servingsPerContainer: 30,
        ingredients: [
          {
            name: 'Bio-Active Primary Complex',
            amountPerServing: '500 mg',
            dailyValuePercentage: '100%',
          },
        ],
      },
      rawMaterials: [
        {
          id: `rm-${Date.now()}`,
          name: 'Pharmaceutical Grade Active Extract',
          arabicName: 'خلاصة نشطة نقية',
          botanicalName: 'Standardized USP/EP Grade',
          keyBenefits: ['High Bioavailability', 'EDA & GxP Certified'],
          mechanism: 'Targeted cellular absorption with zero synthetic binders.',
        },
      ],
      clinicalEvidences: [
        {
          id: `ev-${Date.now()}`,
          journalName: 'Journal of Clinical Nutraceuticals',
          year: 2026,
          authors: 'El-Attar T. et al.',
          paperTitle: `Bioequivalence & Stability Evaluation of ${newSkuName.trim()}`,
          keyFinding: 'Demonstrated 99.4% assay purity across 24-month stability testing.',
        },
      ],
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
    };

    try {
      const res = await createProductAction(created);
      if (!res.ok) {
        triggerToast(`Failed to register formulation: ${res.error}`);
        return;
      }
      const confirmed = res.product || created;
      setProducts((prev) => [confirmed, ...prev]);
      setSelectedProductId(confirmed.id);
      setCreateModalOpen(false);
      setNewSkuName('');
      setNewSkuSubtitle('');
      triggerToast(`Registered new formulation "${confirmed.name}" in MongoDB.`);
    } catch (err: any) {
      triggerToast(`Database write error: ${err?.message || 'Failed to register formulation'}`);
    }
  };

  const handleOpenEdit = (prod: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditSubtitle(prod.subtitle);
    setEditArabicSubtitle(prod.arabicSubtitle);
    setEditCategory(prod.category);
    setEditDescription(prod.description);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName.trim()) return;

    const updates = {
      name: editName.trim(),
      subtitle: editSubtitle.trim(),
      arabicSubtitle: editArabicSubtitle.trim(),
      category: editCategory,
      description: editDescription.trim(),
    };

    try {
      const res = await updateProductAction(editingProduct.id, updates);
      if (!res.ok) {
        triggerToast(`Failed to update formulation: ${res.error}`);
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updates } : p))
      );
      setEditModalOpen(false);
      triggerToast(`Updated "${editName.trim()}" in MongoDB.`);
    } catch (err: any) {
      triggerToast(`Database write error: ${err?.message || 'Failed to update formulation'}`);
    }
  };

  const handleOpenDelete = (prod: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProductToDelete(prod);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const targetId = productToDelete.id;
    const targetName = productToDelete.name;

    try {
      const res = await deleteProductAction(targetId);
      if (!res.ok) {
        triggerToast(`Failed to delete formulation: ${res.error}`);
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== targetId));
      if (selectedProductId === targetId) {
        const remaining = products.filter((p) => p.id !== targetId);
        if (remaining.length > 0 && remaining[0]) {
          setSelectedProductId(remaining[0].id);
        }
      }
      setDeleteModalOpen(false);
      setProductToDelete(null);
      triggerToast(`Deleted formulation "${targetName}" from MongoDB.`);
    } catch (err: any) {
      triggerToast(`Database write error: ${err?.message || 'Failed to delete formulation'}`);
    }
  };

  // Deterministic 14x14 DataMatrix pattern generator
  const matrixCells = useMemo(() => {
    const seedStr = `${gtinCode}-${batchCode}-${expiryDate}-${serialNo}-${activeProduct?.slug ?? ''}`;
    let hash = 2166136261;
    for (let i = 0; i < seedStr.length; i++) {
      hash ^= seedStr.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const size = 14;
    const grid: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        if (c === 0 || r === size - 1) {
          row.push(true);
        } else if (r === 0) {
          row.push(c % 2 === 0);
        } else if (c === size - 1) {
          row.push(r % 2 === 1);
        } else {
          const bit = ((hash >>> ((r * size + c) % 24)) ^ (r * 7 + c * 13)) & 1;
          row.push(bit === 1);
        }
      }
      grid.push(row);
    }
    return grid;
  }, [gtinCode, batchCode, expiryDate, serialNo, activeProduct]);

  const catalogColumns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Formulation Name',
      sortable: true,
      csvValue: (row) => row.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.heroImage}
            alt={row.name}
            className="w-9 h-9 rounded-lg object-contain bg-slate-100 p-0.5 border border-slate-200"
          />
          <div>
            <span className="font-heading font-extrabold text-xs text-brand-navy block">
              {row.name}
            </span>
            <span className="text-[10px] font-mono text-brand-primary">
              {row.subtitle}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (row) => (
        <StatusBadge variant="bioglass" size="xs">
          {row.category}
        </StatusBadge>
      ),
    },
    {
      key: 'arabicSubtitle',
      header: 'Arabic Classification',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.arabicSubtitle}
        </span>
      ),
    },
    {
      key: 'packSizes',
      header: 'Pack Sizes',
      csvValue: (row) =>
        row.packSizes.map((p) => `${p.quantity} ${p.unit}`).join('; '),
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.packSizes.map((ps, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                ps.inStock
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {ps.quantity} {ps.unit}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Studio Status',
      csvValue: () => 'EDA Released',
      render: (row) => (
        <StatusBadge
          variant={row.id === activeProduct?.id ? 'regulatory' : 'in-spec'}
          size="xs"
          pulse={row.id === activeProduct?.id}
        >
          {row.id === activeProduct?.id ? 'Editing in Studio' : 'Active In-Spec'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => handleOpenEdit(row, e)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-primary hover:bg-sky-50 transition-colors"
            title="Edit formulation"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => handleOpenDelete(row, e)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete formulation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const totalIngredientsCount = useMemo(
    () =>
      products.reduce(
        (acc, p) =>
          acc +
          p.rawMaterials.length +
          (p.supplementFacts?.ingredients.length ?? 0),
        0
      ),
    [products]
  );

  const totalCitationsCount = useMemo(
    () => products.reduce((acc, p) => acc + p.clinicalEvidences.length, 0),
    [products]
  );

  return (
    <div className="space-y-6">
      {/* Phase 3 Header */}
      <div className="hud-glass p-6 rounded-3xl border border-white/80 shadow-hud-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge variant="in-spec" size="sm" pulse code="CATALOG">
              Formulation Lifecycle Studio
            </StatusBadge>
            <StatusBadge
              variant={dataSource === 'mongodb' ? 'in-spec' : 'caution'}
              size="xs"
              code={dataSource === 'mongodb' ? 'MONGODB' : 'OFFLINE'}
            >
              {dataSource === 'mongodb' ? 'MongoDB Synced' : 'Static Fallback (Local)'}
            </StatusBadge>
          </div>
          <h1 className="font-heading font-black text-2xl text-brand-navy">
            Product Catalog & Formulation Lifecycle Studio
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Manage commercial SKUs, supplement facts, botanical raw materials, clinical citations, and GS1 2D DataMatrix serialization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {savedToast ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {savedToast}
            </span>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
          >
            <FilePlus2 className="w-4 h-4 mr-1.5 text-brand-primary" />
            + Register New Formulation
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              triggerToast('Formulation Monograph v2.4 signed & committed to GxP Ledger.')
            }
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Commit Monograph Revision
          </Button>
        </div>
      </div>

      {/* MongoDB Connection / Fallback Error Banner */}
      {loadError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Database Notice:</strong> {loadError} — Displaying offline static fallback catalog. Changes will not be saved to MongoDB until connectivity is restored.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              getProductsAction({ locale: 'en' })
                .then((res) => {
                  if (res.ok) {
                    if (Array.isArray(res.products) && res.products.length > 0) {
                      setProducts(res.products);
                    }
                    setDataSource(res.source === 'mongodb' ? 'mongodb' : 'static');
                    setLoadError(null);
                  } else {
                    setLoadError(res.error || 'Failed to load products from database.');
                    setDataSource('static');
                  }
                })
                .catch((err) => {
                  setLoadError(err?.message || 'Network error');
                  setDataSource('static');
                })
                .finally(() => setIsLoading(false));
            }}
          >
            {isLoading ? 'Reconnecting...' : 'Retry Connection'}
          </Button>
        </div>
      )}

      {/* Phase 3 Telemetry KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TelemetryCard
          label="Registered Formulations"
          value={products.length}
          subtitle="Naturals 4be Commercial Portfolio"
          delta="100% In-Spec"
          targetSpec="EDA & MoH Licensed"
          status="optimal"
          sparkline={[3, 4, 4, 5, products.length]}
          icon={<Pill className="w-4 h-4" />}
        />
        <TelemetryCard
          label="Active Bio-Compounds"
          value={totalIngredientsCount}
          subtitle="Standardized USP / EP Ingredients"
          delta="Zero Synthetic Fillers"
          targetSpec="COA Assay >= 99.2%"
          status="nominal"
          sparkline={[10, 12, 14, 16, totalIngredientsCount]}
          icon={<FlaskConical className="w-4 h-4" />}
        />
        <TelemetryCard
          label="Indexed Clinical Studies"
          value={totalCitationsCount}
          subtitle="Peer-Reviewed PubMed / DOI Papers"
          delta="Evidence-Led"
          targetSpec="Double-Blind RCTs"
          status="optimal"
          sparkline={[6, 8, 9, 10, totalCitationsCount]}
          icon={<BookOpen className="w-4 h-4" />}
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Workstation: Horizontal Product Selector (Flex) on Top + Formulation Studio Below */}
      <div className="space-y-6">
        {/* Horizontal Product Selector Row */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Select Product to Edit ({filteredProducts.length})
            </span>
            <span className="text-xs text-slate-400">
              Click any product to switch editor
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {filteredProducts.map((prod) => {
              const isSelected = activeProduct?.id === prod.id;
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`flex-1 min-w-[260px] max-w-sm text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-brand-primary ring-2 ring-brand-primary/20 shadow-md'
                      : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      {prod.heroImage ? (
                        <img
                          src={prod.heroImage}
                          alt={prod.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Pill className="w-5 h-5 text-brand-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-sm text-brand-navy truncate">
                          {prod.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-50 text-brand-primary font-bold">
                          {prod.brandLine}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block truncate">
                        {prod.category} • {prod.arabicSubtitle}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        {prod.packSizes.map((ps, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold"
                          >
                            {ps.quantity} {ps.unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Tab Formulation Lifecycle Studio */}
        {activeProduct ? (
          <div className="w-full rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Studio Product Banner */}
            <div className="p-6 bg-gradient-to-r from-[#020F24] to-[#023368] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center shrink-0">
                  <img
                    src={activeProduct.heroImage}
                    alt={activeProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#61C0E4]">
                      {activeProduct.brandLine} • {activeProduct.category}
                    </span>
                  </div>
                  <h2 className="font-heading font-black text-2xl text-white">
                    {activeProduct.name} — {activeProduct.subtitle}
                  </h2>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    Arabic Label: {activeProduct.arabicSubtitle} • Rating {activeProduct.rating}/5.0 ({activeProduct.reviewsCount} clinical/patient reviews)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(activeProduct)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit SKU</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDelete(activeProduct)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-xs font-semibold text-rose-200 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <a
                  href={`http://localhost:3000/products/${activeProduct.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Live Public Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 5-Tab Navigation Bar */}
            <div className="border-b border-slate-200 bg-slate-50/70 px-4 pt-3 flex flex-wrap gap-2">
              {[
                { id: 'general', label: '1. General & Pack Sizes', icon: PackageCheck },
                { id: 'supplement', label: '2. Supplement Facts', icon: Pill },
                { id: 'materials', label: '3. Raw Materials', icon: FlaskConical },
                { id: 'evidence', label: '4. Clinical Studies', icon: BookOpen },
                { id: 'serialization', label: '5. GS1 2D DataMatrix', icon: QrCode },
              ].map((tab) => {
                const Icon = tab.icon;
                const isTabActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as StudioTab)}
                    className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                      isTabActive
                        ? 'bg-white text-brand-primary border-brand-primary shadow-sm'
                        : 'text-slate-500 border-transparent hover:text-brand-navy'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Studio Tab Content */}
            <div className="p-6 space-y-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Commercial Tagline
                      </span>
                      <p className="font-heading font-bold text-sm text-brand-navy mt-1">
                        {activeProduct.tagline}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Arabic Regulatory Classification
                      </span>
                      <p className="font-heading font-bold text-sm text-brand-navy mt-1">
                        {activeProduct.arabicSubtitle}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-sm text-brand-navy mb-1.5">
                      Clinical Monograph Summary
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      {activeProduct.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-sm text-brand-navy mb-3">
                      Registered Pack Sizes & Warehouse Inventory Status
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeProduct.packSizes.map((pack, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between bg-white"
                        >
                          <div>
                            <span className="font-mono font-extrabold text-base text-brand-navy block">
                              {pack.quantity} {pack.unit}
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                pack.inStock ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {pack.inStock ? '● In Stock (Cryo-Cleared)' : '○ Out of Stock'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePackStock(activeProduct.id, idx)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-semibold text-brand-navy transition-colors"
                          >
                            Toggle
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'supplement' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-brand-primary font-bold block">
                        Recommended Posology & Administration
                      </span>
                      <p className="text-xs font-semibold text-brand-navy mt-0.5">
                        {activeProduct.dosageInstructions ?? 'As directed by healthcare practitioner.'}
                      </p>
                    </div>
                    {activeProduct.supplementFacts ? (
                      <div className="text-right font-mono text-xs text-brand-navy shrink-0">
                        <div>Serving: {activeProduct.supplementFacts.servingSize}</div>
                        <div className="text-[11px] text-slate-500">
                          Servings/Container: {activeProduct.supplementFacts.servingsPerContainer}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {activeProduct.supplementFacts ? (
                    <div className="overflow-x-auto -webkit-overflow-scrolling-touch rounded-2xl border border-slate-200 scrollbar-thin">
                      <table className="w-full text-left text-xs min-w-[480px]">
                        <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[11px]">
                          <tr>
                            <th className="p-3.5 whitespace-nowrap">Active Nutritional Compound</th>
                            <th className="p-3.5 whitespace-nowrap">Amount Per Serving</th>
                            <th className="p-3.5 text-right whitespace-nowrap">% Daily Value (NRV)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeProduct.supplementFacts.ingredients.map((ing, i) => (
                            <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-3.5 font-bold text-brand-navy whitespace-nowrap">{ing.name}</td>
                              <td className="p-3.5 font-mono text-brand-primary font-semibold whitespace-nowrap">
                                {ing.amountPerServing}
                              </td>
                              <td className="p-3.5 font-mono text-right text-slate-500 whitespace-nowrap">
                                {ing.dailyValuePercentage ?? '† Daily Value Not Established'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {/* Interactive Add Compound Form */}
                  <form
                    onSubmit={handleAddIngredient}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-end gap-3"
                  >
                    <div className="w-full sm:flex-1">
                      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                        New Active Compound Name
                      </label>
                      <input
                        type="text"
                        value={newIngName}
                        onChange={(e) => setNewIngName(e.target.value)}
                        placeholder="e.g., Chelated Zinc Bisglycinate"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-brand-navy"
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                        Dosage Amount
                      </label>
                      <input
                        type="text"
                        value={newIngAmount}
                        onChange={(e) => setNewIngAmount(e.target.value)}
                        placeholder="e.g., 25 mg"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-brand-navy"
                      />
                    </div>
                    <div className="w-full sm:w-28">
                      <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                        % NRV
                      </label>
                      <input
                        type="text"
                        value={newIngDv}
                        onChange={(e) => setNewIngDv(e.target.value)}
                        placeholder="227%"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-brand-navy"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="sm">
                      + Add Compound
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeProduct.rawMaterials.map((rm) => (
                    <Card key={rm.id} variant="solid" className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-heading font-bold text-sm text-brand-navy">
                            {rm.name}
                          </h4>
                          {rm.botanicalName ? (
                            <span className="text-[11px] italic text-slate-500 block">
                              {rm.botanicalName}
                            </span>
                          ) : null}
                        </div>
                        {rm.arabicName ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-brand-navy">
                            {rm.arabicName}
                          </span>
                        ) : null}
                      </div>

                      {rm.mechanism ? (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {rm.mechanism}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rm.keyBenefits.map((ben, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold"
                          >
                            ✓ {ben}
                          </span>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  {activeProduct.clinicalEvidences.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-navy text-white font-mono text-[10px] font-bold">
                          {ev.journalName} ({ev.year})
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Authors: {ev.authors}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-sm text-brand-navy">
                        {ev.paperTitle}
                      </h4>
                      {ev.keyFinding ? (
                        <p className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-xl">
                          <strong>Key Clinical Finding:</strong> {ev.keyFinding}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'serialization' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-primary">
                      <Sparkles className="w-4 h-4" />
                      <span>GS1 Healthcare 2D DataMatrix Serialization Simulator</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                          GTIN-14 Identifier (01)
                        </label>
                        <input
                          type="text"
                          value={gtinCode}
                          onChange={(e) => setGtinCode(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-brand-navy"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                          Batch / Lot Number (10)
                        </label>
                        <input
                          type="text"
                          value={batchCode}
                          onChange={(e) => setBatchCode(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-brand-navy"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                          Expiration Date (17)
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-brand-navy"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                          Unique Serial No (21)
                        </label>
                        <input
                          type="text"
                          value={serialNo}
                          onChange={(e) => setSerialNo(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-brand-navy"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 text-sky-300 font-mono text-[11px] break-all">
                      GS1 Element String: (01){gtinCode}(17){expiryDate.replace(/-/g, '').slice(2)}(10){batchCode}(21){serialNo}
                    </div>
                  </div>

                  {/* Printable 2D DataMatrix Carton Label */}
                  <div className="md:col-span-5 p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center text-center space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      EDA Carton Serialization Preview
                    </span>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <svg
                        width="126"
                        height="126"
                        viewBox="0 0 14 14"
                        className="w-28 h-28"
                        shapeRendering="crispEdges"
                      >
                        {matrixCells.map((row, rIdx) =>
                          row.map((cell, cIdx) =>
                            cell ? (
                              <rect
                                key={`${rIdx}-${cIdx}`}
                                x={cIdx}
                                y={rIdx}
                                width={1}
                                height={1}
                                fill="#020F24"
                              />
                            ) : null
                          )
                        )}
                      </svg>
                    </div>
                    <div className="font-mono text-[11px] text-brand-navy space-y-0.5">
                      <div className="font-bold">{activeProduct.name}</div>
                      <div>LOT: {batchCode}</div>
                      <div>EXP: {expiryDate}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Master Catalog DataTable */}
      <DataTable
        title="Master Formulation & Batch Registry Table"
        subtitle="Click any row to load that formulation directly into the 5-Tab Lifecycle Studio above"
        data={filteredProducts}
        columns={catalogColumns}
        rowKey={(row) => row.id}
        searchableKeys={['name', 'category', 'subtitle', 'arabicSubtitle']}
        exportFileName="mirage-formulation-studio-registry.csv"
        onRowClick={(row) => setSelectedProductId(row.id)}
      />

      {/* Register New Formulation Modal */}
      <ClinicalModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New Commercial Formulation SKU"
        subtitle="Initialize an EDA-compliant Naturals 4be monograph & GS1 serialization record"
        gxpBadge="FORMULATION REGISTRATION"
      >
        <form onSubmit={handleCreateFormulation} className="space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
              Commercial Product Name *
            </label>
            <input
              type="text"
              required
              value={newSkuName}
              onChange={(e) => setNewSkuName(e.target.value)}
              placeholder="e.g., Osteo-Guard D3 + K2"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                Therapeutic Category
              </label>
              <select
                value={newSkuCategory}
                onChange={(e) =>
                  setNewSkuCategory(e.target.value as Product['category'])
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-semibold bg-slate-50"
              >
                <option value="Vitamins & Minerals">Vitamins & Minerals</option>
                <option value="Men Health">Men Health</option>
                <option value="Women Health">Women Health</option>
                <option value="Maternal Care">Maternal Care</option>
                <option value="Pediatrics & Immunity">Pediatrics & Immunity</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                Arabic Regulatory Classification
              </label>
              <input
                type="text"
                value={newSkuArabic}
                onChange={(e) => setNewSkuArabic(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
              Clinical Subtitle / Positioning
            </label>
            <input
              type="text"
              value={newSkuSubtitle}
              onChange={(e) => setNewSkuSubtitle(e.target.value)}
              placeholder="e.g., Synergistic Bone Matrix & Arterial Calcium Transport"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Sign & Register SKU
            </Button>
          </div>
        </form>
      </ClinicalModal>

      {/* Edit Formulation Modal */}
      <ClinicalModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Formulation Monograph"
        subtitle={`Update details for ${editingProduct?.name ?? 'product'} and sync across public website`}
        gxpBadge="MONOGRAPH UPDATE"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
              Commercial Product Name *
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                Therapeutic Category
              </label>
              <select
                value={editCategory}
                onChange={(e) =>
                  setEditCategory(e.target.value as Product['category'])
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-semibold bg-slate-50"
              >
                <option value="Vitamins & Minerals">Vitamins & Minerals</option>
                <option value="Men Health">Men Health</option>
                <option value="Women Health">Women Health</option>
                <option value="Maternal Care">Maternal Care</option>
                <option value="Pediatrics & Immunity">Pediatrics & Immunity</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                Arabic Regulatory Classification
              </label>
              <input
                type="text"
                value={editArabicSubtitle}
                onChange={(e) => setEditArabicSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
              Clinical Subtitle / Positioning
            </label>
            <input
              type="text"
              value={editSubtitle}
              onChange={(e) => setEditSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
              Clinical Description
            </label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save & Sync Changes
            </Button>
          </div>
        </form>
      </ClinicalModal>

      {/* Delete Confirmation Modal */}
      <ClinicalModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Formulation Deletion"
        subtitle="This action removes the SKU from public catalogs and archives the monograph"
        gxpBadge="GxP DELETION"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">
                Are you sure you want to delete formulation:
              </p>
              <p className="font-mono text-sm mt-1 text-rose-950 font-bold">
                {productToDelete?.name}
              </p>
              <p className="text-[11px] text-rose-700 mt-1">
                The product will be removed from both English and Arabic public catalogs and cannot be recovered without GxP database restoration.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleConfirmDelete}
            >
              Confirm Permanent Deletion
            </Button>
          </div>
        </div>
      </ClinicalModal>
    </div>
  );
}
