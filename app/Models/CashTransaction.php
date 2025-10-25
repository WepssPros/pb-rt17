<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class CashTransaction extends Model
{
    use HasFactory;
    protected $fillable = ['cash_account_id', 'type', 'amount', 'reference_type', 'reference_id', 'description', 'journal_id'];
    public function account()
    {
        return $this->belongsTo(CashAccount::class, 'cash_account_id');
    }
}
