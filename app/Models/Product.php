<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Product extends Model
{
    use HasFactory;
    protected $fillable = ['sku', 'name', 'unit', 'unit_content', 'cost_price', 'sell_price', 'notes'];


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


    public function toBaseQty(int $qty, ?string $unit = null): int
    {
        $unit = $unit ?? $this->unit;
        if ($unit === 'pcs' || $this->unit_content <= 1) return $qty;
        return $qty * $this->unit_content;
    }
}
