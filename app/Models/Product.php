<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Product extends Model
{
    use HasFactory;
    protected $fillable = ['sku', 'name', 'unit', 'unit_content', 'child_product_id', 'pcs_per_unit', 'cost_price', 'sell_price', 'notes'];


    public function stock()
    {
        return $this->hasOne(Stock::class);
    }
    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }
    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Produk pcs (child) yang terkait dengan tube ini.
     * Contoh: SHT-001 (tube) → BALL-001 (pcs)
     */
    public function childProduct()
    {
        return $this->belongsTo(Product::class, 'child_product_id');
    }

    /**
     * Produk tube (parent) yang merujuk ke pcs ini.
     * Contoh: BALL-001 (pcs) ← SHT-001 (tube)
     */
    public function parentProducts()
    {
        return $this->hasMany(Product::class, 'child_product_id');
    }

    /**
     * Apakah produk ini adalah tube yang punya linked pcs child?
     */
    public function hasChildProduct(): bool
    {
        return !is_null($this->child_product_id);
    }

    /**
     * Apakah produk ini adalah pcs yang jadi child dari tube?
     */
    public function isChildProduct(): bool
    {
        return self::where('child_product_id', $this->id)->exists();
    }


    public function toBaseQty(int $qty, ?string $unit = null): int
    {
        $unit = $unit ?? $this->unit;
        if ($unit === 'pcs' || $this->unit_content <= 1) return $qty;
        return $qty * $this->unit_content;
    }
}
