<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class SaleItem extends Model
{
    use HasFactory;
    protected $fillable = ['sale_id', 'product_id', 'qty', 'unit', 'sell_price', 'line_total'];
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
