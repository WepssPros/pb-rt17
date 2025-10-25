<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Purchase extends Model
{
    use HasFactory;
    protected $fillable = ['reference_no', 'purchase_date', 'total', 'paid', 'supplier', 'note'];
    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }
}
