import React from "react";
import {
    ArrowDownLeftIcon,
    ArrowUpRightIcon,
    BanknoteArrowDownIcon,
    BanknoteArrowUpIcon,
    ReceiptTextIcon,
    WalletCardsIcon,
} from "lucide-react";

import { cnValue, stripHtml } from "@/admin/utils";

export function truncateCell(value, maxLength = 20) {
    const clean = stripHtml(value);

    if (clean.length <= maxLength) {
        return clean;
    }

    return `${clean.slice(0, maxLength).trimEnd()}…`;
}

export function getTransactionTone(typeLabel) {
    const label = stripHtml(typeLabel).toLowerCase();

    if (label.includes("debit")) {
        return "debit";
    }

    if (label.includes("kredit") || label.includes("credit")) {
        return "credit";
    }

    return "neutral";
}

export function TableMetaCell({
    icon: Icon,
    value,
    tone = "neutral",
    truncate = false,
    maxLength = 20,
    className,
    textClassName,
}) {
    const clean = stripHtml(value || "-");
    const display = truncate ? truncateCell(clean, maxLength) : clean;

    return (
        <div className={cnValue("app-cell-meta", `app-cell-${tone}`, className)}>
            {Icon ? (
                <span className="app-cell-meta__icon">
                    <Icon className="size-3.5" />
                </span>
            ) : null}
            <span
                className={cnValue(
                    "app-cell-meta__text",
                    truncate ? "app-cell-truncate" : "",
                    textClassName
                )}
            >
                {display || "-"}
            </span>
        </div>
    );
}

export function TransactionTypeBadge({ value, className }) {
    const tone = getTransactionTone(value);
    const Icon = tone === "debit" ? ArrowDownLeftIcon : tone === "credit" ? ArrowUpRightIcon : ReceiptTextIcon;

    return (
        <span className={cnValue("app-cell-flow-badge", `app-cell-flow-${tone}`, className)}>
            <Icon className="size-3.5" />
            <span>{stripHtml(value || "-")}</span>
        </span>
    );
}

export function MoneyValueCell({
    value,
    tone = "neutral",
    icon: Icon,
    className,
    textClassName,
}) {
    const ResolvedIcon =
        Icon || (tone === "debit" ? BanknoteArrowDownIcon : tone === "credit" ? BanknoteArrowUpIcon : WalletCardsIcon);

    return (
        <div className={cnValue("app-cell-money", `app-cell-${tone}`, className)}>
            <span className="app-cell-money__icon">
                <ResolvedIcon className="size-3.5" />
            </span>
            <span className={cnValue("app-cell-money__value", textClassName)}>
                {stripHtml(value || "-")}
            </span>
        </div>
    );
}

export function renderTransactionType(typeLabel) {
    return <TransactionTypeBadge value={typeLabel} />;
}

export function renderMoneyCell(value, options = {}) {
    return <MoneyValueCell value={value} {...options} />;
}
