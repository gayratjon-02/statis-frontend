// =============================================
// TYPES — Admin (mirrors backend admin types & DTOs)
// =============================================

import React from "react";
import { AdminRole } from "../enums/admin.enum";

// ── Admin Nav Items ────────────────────────────────────────

export interface AdminNavItem {
  icon: string;
  label: string;
  id: string;
  title: string;
  subtitle: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { icon: "📊", label: "Dashboard", id: "dashboard", title: "Dashboard", subtitle: "Platform overview — users, generations, and activity" },
  { icon: "👥", label: "Users", id: "users", title: "User Management", subtitle: "Search, filter, block or reactivate user accounts" },
  { icon: "🎨", label: "Concepts", id: "concepts", title: "Concept Library", subtitle: "Manage, search, and organize ad concepts" },
  { icon: "⭐", label: "Recommended", id: "recommended", title: "Recommended Concepts", subtitle: "Top performing concepts by usage" },
  { icon: "🏷️", label: "Categories", id: "categories", title: "Category Management", subtitle: "Create and manage concept categories" },
  { icon: "📦", label: "Canva Orders", id: "canva", title: "Canva Orders", subtitle: "View and fulfill Canva template orders — set link and send email" },
  { icon: "📝", label: "Prompt Management", id: "prompts", title: "Prompt Management", subtitle: "Edit AI system prompts used for ad generation" },
  { icon: "🎟️", label: "Invite Tokens", id: "invites", title: "Invite Tokens", subtitle: "Generate and manage admin invite tokens" },
];

// ── Admin User ──────────────────────────────────────────────

/** Admin user returned from API (no password_hash) */
export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: AdminRole;
  created_at: string;
}

/** Admin login/signup response */
export interface AdminAuthResponse {
  accessToken: string;
  admin: AdminUser;
}

// ── Admin Auth DTOs ─────────────────────────────────────────

/** POST /member/adminSignup */
export interface AdminSignupInput {
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  inviteToken?: string;
}

/** POST /member/adminLogin */
export interface AdminLoginInput {
  email: string;
  password: string;
}

// ── Admin Concept DTOs ──────────────────────────────────────

/** POST /concept/createConceptByAdmin */
export interface CreateConceptInput {
  category_id: string;
  name: string;
  image_url: string;
  tags: string[];
  description: string;
  source_url?: string;
  is_active?: boolean;
  display_order?: number;
}

/** POST /concept/updateConceptByAdmin/:id */
export interface UpdateConceptInput {
  category_id?: string;
  name?: string;
  image_url?: string;
  tags?: string[];
  description?: string;
  source_url?: string;
  is_active?: boolean;
  display_order?: number;
}

/** POST /concept/createCategoryByAdmin */
export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  display_order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  display_order?: number;
}

/** POST /concept/reorderConceptsByAdmin */
export interface ReorderConceptsInput {
  category_id: string;
  items: { id: string; display_order: number }[];
}

// ── Admin GET Response Types ────────────────────────────────

/** GET /concept/getConcepts response */
export interface ConceptsResponse {
  list: import("./concept.type").AdConcept[];
  total: number;
}

/** GET /concept/getConcepts query params */
export interface GetConceptsParams {
  category_id?: string;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

// ── Admin Dashboard Props ──────────────────────────────────

export interface AdminPlatformStats {
  users: { total: number; paid: number; active: number };
  generations: {
    today: number;
    this_week: number;
    total: number;
    completed: number;
    failed: number;
  };
}

export interface DashboardProps {
  platformStats: AdminPlatformStats | null;
  total: number;
  activeCount: number;
  categoriesCount: number;
  topCategory: [string, number] | undefined;
  recommended: import("./concept.type").AdConcept[];
  resolveImageUrl: (url?: string) => string;
  setActiveNav: (nav: string) => void;
  renderConceptGrid: (draggable: boolean) => React.ReactNode;
}

// ── Admin Users Tab Props ─────────────────────────────────

export interface UsersTabUser {
  _id: string;
  email: string;
  full_name: string;
  member_status: string;
  subscription_tier: string;
  subscription_status: string;
  credits_used: number;
  credits_limit: number;
  created_at: string;
}

export interface UsersTabProps {
  users: UsersTabUser[];
  usersTotal: number;
  usersPage: number;
  usersLoading: boolean;
  userSearch: string;
  userTierFilter: string;
  userStatusFilter: string;
  setUserSearch: (v: string) => void;
  setUserTierFilter: (v: string) => void;
  setUserStatusFilter: (v: string) => void;
  setUsersPage: React.Dispatch<React.SetStateAction<number>>;
  handleBlockUser: (user: UsersTabUser) => void;
  handleDeleteUser: (user: UsersTabUser) => void;
}

// ── Admin Concepts Tab Props ──────────────────────────────

export interface ConceptsTabProps {
  total: number;
  search: string;
  setSearch: (v: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  categoryFilters: { value: string; label: string }[];
  openModal: () => void;
  renderConceptGrid: (draggable: boolean) => React.ReactNode;
}

// ── Admin Recommended Tab Props ───────────────────────────

export interface RecommendedTabProps {
  recommended: import("./concept.type").AdConcept[];
  resolveImageUrl: (url?: string) => string;
  getCategoryName: (categoryId?: string, categoryName?: string) => string;
  fetchRecommended: () => void;
}

// ── Admin Categories Tab Props ────────────────────────────

export interface CategoriesTabProps {
  categories: import("./concept.type").ConceptCategoryItem[];
  deletingCatId: string | null;
  openAddCategory: () => void;
  openEditCategory: (cat: import("./concept.type").ConceptCategoryItem) => void;
  handleDeleteCategory: (id: string) => void;
}

// ── Admin Canva Orders Tab Props ──────────────────────────

export interface CanvaOrdersTabProps {
  canvaOrders: import("../../server/admin/admnGetApis").CanvaOrderAdmin[];
  canvaOrdersLoading: boolean;
  canvaFulfillId: string | null;
  canvaFulfillLink: string;
  canvaFulfilling: boolean;
  canvaFulfillError: string;
  setCanvaFulfillId: (id: string | null) => void;
  setCanvaFulfillLink: (v: string) => void;
  fetchCanvaOrders: () => void;
  handleFulfill: (orderId: string) => void;
}

// ── Admin Prompt Management Tab Props ─────────────────────

export interface PromptManageTabProps {
  promptTemplates: import("../../server/admin/admnGetApis").PromptTemplateAdmin[];
  promptTemplatesLoading: boolean;
  promptEditId: string | null;
  promptEditContent: string;
  promptEditActive: boolean;
  promptSaveLoading: boolean;
  promptSaveError: string;
  setPromptEditId: (id: string | null) => void;
  setPromptEditContent: (v: string) => void;
  setPromptEditActive: (v: boolean) => void;
  setPromptSaveError: (v: string) => void;
  fetchPromptTemplates: () => void;
  handleSavePrompt: (templateId: string) => void;
}

// ── Admin Invite Tokens Tab Props ─────────────────────────

export interface InviteTokensTabProps {
  invites: import("../../server/admin/admnGetApis").AdminInvite[];
  invitesLoading: boolean;
  invitesError: string;
  generatedInvite: string;
  isGeneratingInvite: boolean;
  handleGenerateInvite: (role: AdminRole) => void;
}

// ── Admin Concept Modal Props ─────────────────────────────

export interface ConceptModalProps {
  title: string;
  show: boolean;
  loading: boolean;
  error: string;
  name: string;
  categoryId: string;
  description: string;
  tags: string;
  sourceUrl: string;
  imagePreview: string;
  categories: import("./concept.type").ConceptCategoryItem[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setName: (v: string) => void;
  setCategoryId: (v: string) => void;
  setDescription: (v: string) => void;
  setTags: (v: string) => void;
  setSourceUrl: (v: string) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitLabel: string;
  loadingLabel: string;
}

// ── Admin Sidebar Props ───────────────────────────────────

export interface AdminSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  adminName: string;
  adminRole: string;
  onLogout: () => void;
}
