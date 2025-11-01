<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'target_amount',
        'target_date',
        'cash_account_id',
        
    ];

    public function cashAccount()
    {
        return $this->belongsTo(CashAccount::class, 'cash_account_id');
    }

    // Hitung persentase pencapaian
    public function getAchievementAttribute()
    {
        $saldo = $this->cashAccount?->balance ?? 0;
        if ($this->target_amount <= 0) {
            return 0;
        }

        return round(($saldo / $this->target_amount) * 100, 2);
    }

    // Status (apakah target bisa dicapai)
    public function getStatusAttribute()
    {
        return ($this->cashAccount?->balance ?? 0) >= $this->target_amount
            ? 'Tercapai'
            : 'Belum Tercapai';
    }
}
