<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class StockMovement extends Model
{
    use HasFactory;
    protected $fillable = ['product_id', 'movement_type', 'quantity', 'unit', 'unit_quantity', 'reference_type', 'reference_id', 'cost_per_unit', 'sell_price_per_unit', 'note'];
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
