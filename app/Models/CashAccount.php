<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class CashAccount extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'code', 'balance'];
    public function transactions()
    {
        return $this->hasMany(CashTransaction::class, 'cash_account_id');
    }
}
