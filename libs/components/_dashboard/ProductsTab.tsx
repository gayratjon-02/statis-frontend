import React from "react";
import type { Product } from "../../types/product.type";
import type { Brand } from "../../types/brand.type";
import API_BASE_URL from "../../config/api.config";

interface ProductsTabProps {
  products: Product[];
  brands: Brand[];
  loading: boolean;
  brandFilter: string;
  deletingProductId: string | null;
  setBrandFilter: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  getBrandName: (brandId: string) => string;
}

function resolveImageUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

const PRODUCT_COLORS = [
  "#3ECFCF",
  "#22C55E",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#6366F1",
];

export default function ProductsTab({
  products,
  brands,
  loading,
  brandFilter,
  deletingProductId,
  setBrandFilter,
  onEdit,
  onDelete,
  onCreateNew,
  getBrandName,
}: ProductsTabProps) {
  return (
    <div className="products-page">
      {/* Stats Row */}
      <div className="products-page__stats">
        <div className="products-stat">
          <span
            className="products-stat__value"
            style={{ color: "var(--accent)" }}
          >
            {products.length}
          </span>
          <span className="products-stat__label">Total Products</span>
        </div>
        <div className="products-stat">
          <span
            className="products-stat__value"
            style={{ color: "var(--green)" }}
          >
            {brands.length}
          </span>
          <span className="products-stat__label">Brands</span>
        </div>
        <div className="products-stat">
          <span
            className="products-stat__value"
            style={{ color: "var(--g1)" }}
          >
            {products.filter((p) => p.has_physical_product).length}
          </span>
          <span className="products-stat__label">Physical Products</span>
        </div>
      </div>

      {/* Brand Filter */}
      {brands.length > 1 && (
        <div className="products-page__filters">
          <button
            className={`products-page__filter-btn ${brandFilter === "all" ? "products-page__filter-btn--active" : ""}`}
            onClick={() => setBrandFilter("all")}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b._id}
              className={`products-page__filter-btn ${brandFilter === b._id ? "products-page__filter-btn--active" : ""}`}
              onClick={() => setBrandFilter(b._id)}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="products-page__loading">
          <div className="products-page__spinner" />
          <span>Loading products...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="products-page__empty">
          <div className="products-page__empty-icon">P</div>
          <h3>No products yet</h3>
          <p>Add your first product to start generating ads</p>
          <button className="btn-generate" onClick={onCreateNew}>
            + Add First Product
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product, i) => (
            <div key={product._id} className="product-card">
              {/* Card Header — product image or placeholder */}
              <div
                className="product-card__header"
                style={{
                  background: product.photo_url
                    ? `url(${resolveImageUrl(product.photo_url)}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${PRODUCT_COLORS[i % 6]}cc, ${PRODUCT_COLORS[(i + 2) % 6]}88)`,
                }}
              >
                {!product.photo_url && (
                  <div className="product-card__placeholder">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="product-card__body">
                <h3 className="product-card__name">{product.name}</h3>
                <span className="product-card__brand">
                  {getBrandName(product.brand_id)}
                </span>

                {product.description && (
                  <p className="product-card__desc">
                    {product.description.length > 80
                      ? product.description.slice(0, 80) + "..."
                      : product.description}
                  </p>
                )}

                {/* Price & Rating */}
                <div className="product-card__meta">
                  {product.price_text && (
                    <span className="product-card__price">
                      {product.price_text}
                    </span>
                  )}
                  {product.star_rating > 0 && (
                    <span className="product-card__rating">
                      {"★".repeat(Math.round(product.star_rating))}{" "}
                      {product.star_rating.toFixed(1)}
                      {product.review_count > 0 && (
                        <span className="product-card__reviews">
                          ({product.review_count})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* USPs */}
                {product.usps && product.usps.length > 0 && (
                  <div className="product-card__usps">
                    {product.usps.slice(0, 3).map((usp) => (
                      <span key={usp} className="product-card__usp">
                        {usp}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="product-card__footer">
                <span className="product-card__date">
                  {new Date(product.created_at).toLocaleDateString()}
                </span>
                <div className="product-card__actions">
                  <button
                    className="product-card__btn"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="product-card__btn product-card__btn--delete"
                    onClick={() => onDelete(product._id)}
                    disabled={deletingProductId === product._id}
                  >
                    {deletingProductId === product._id ? "..." : "✕"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
