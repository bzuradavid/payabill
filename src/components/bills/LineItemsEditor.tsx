"use client";

import { useState } from "react";
import { cn, formatCurrency } from "~/lib/utils";

interface GLAccount {
  id: string;
  code: string;
  name: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  glAccountId?: string;
}

interface LineItemsEditorProps {
  glAccounts: GLAccount[];
  initialItems?: LineItem[];
  onChange: (items: LineItem[]) => void;
}

function newItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    glAccountId: "",
  };
}

export function LineItemsEditor({
  glAccounts,
  initialItems,
  onChange,
}: LineItemsEditorProps) {
  const [items, setItems] = useState<LineItem[]>(
    initialItems ?? [newItem()],
  );

  const update = (updatedItems: LineItem[]) => {
    setItems(updatedItems);
    onChange(updatedItems);
  };

  const setField = (
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        next.amount =
          parseFloat(String(next.quantity)) *
          parseFloat(String(next.unitPrice)) || 0;
      }
      return next;
    });
    update(updated);
  };

  const addItem = () => update([...items, newItem()]);
  const removeItem = (id: string) => update(items.filter((i) => i.id !== id));

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-3">
      {/* Mobile: card per line item */}
      <div className="space-y-3 sm:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Description
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    setField(item.id, "description", e.target.value)
                  }
                  placeholder="Description"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#312D97] focus:ring-1 focus:ring-[#312D97] focus:outline-none"
                  required
                />
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove line item"
                  className="mt-6 shrink-0 rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Qty
                </label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={item.quantity}
                  onChange={(e) =>
                    setField(item.id, "quantity", parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-[#312D97] focus:ring-1 focus:ring-[#312D97] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Unit Price
                </label>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 focus-within:border-[#312D97] focus-within:ring-1 focus-within:ring-[#312D97]">
                  <span className="text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) =>
                      setField(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                    }
                    className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                GL Account
              </label>
              <select
                value={item.glAccountId ?? ""}
                onChange={(e) =>
                  setField(item.id, "glAccountId", e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-[#312D97] focus:ring-1 focus:ring-[#312D97] focus:outline-none"
              >
                <option value="">— None —</option>
                {glAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} · {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Amount
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(item.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
              <th className="px-3 py-2.5 w-[35%]">Description</th>
              <th className="px-3 py-2.5 w-[10%]">Qty</th>
              <th className="px-3 py-2.5 w-[14%]">Unit Price</th>
              <th className="px-3 py-2.5 w-[20%]">GL Account</th>
              <th className="px-3 py-2.5 w-[14%] text-right">Amount</th>
              <th className="px-3 py-2.5 w-[7%]" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      setField(item.id, "description", e.target.value)
                    }
                    placeholder="Description"
                    className="w-full rounded border-0 bg-transparent px-0 py-0.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                    required
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={item.quantity}
                    onChange={(e) =>
                      setField(item.id, "quantity", parseFloat(e.target.value) || 0)
                    }
                    className="w-16 rounded border-0 bg-transparent px-0 py-0.5 text-sm text-slate-900 focus:ring-0 focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-0.5">
                    <span className="text-slate-400">$</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) =>
                        setField(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                      }
                      className="w-full rounded border-0 bg-transparent px-0 py-0.5 text-sm text-slate-900 focus:ring-0 focus:outline-none"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.glAccountId ?? ""}
                    onChange={(e) =>
                      setField(item.id, "glAccountId", e.target.value)
                    }
                    className="w-full rounded border-0 bg-transparent py-0.5 text-sm text-slate-700 focus:ring-0 focus:outline-none"
                  >
                    <option value="">— None —</option>
                    {glAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} · {a.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-right font-medium text-slate-900">
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className={cn(
                      "rounded p-1 text-slate-400 transition-colors hover:text-red-500",
                      items.length === 1 && "invisible",
                    )}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add line item
        </button>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">Total</span>
          <span className="text-lg font-semibold text-slate-900">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
