<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class JournalLine extends Model
{
    use HasFactory;
    protected $fillable = ['journal_id', 'account', 'debit', 'credit', 'note'];

    public function journal()
    {
        return $this->belongsTo(Journal::class, 'journal_id');
    }
}
