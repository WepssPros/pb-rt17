<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Sale extends Model
{
    use HasFactory;
    protected $fillable = ['invoice_no', 'sale_date', 'total', 'paid', 'customer', 'note'];
    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }
}
