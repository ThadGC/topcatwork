'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * A custom-coded dropdown. Never the device's own.
 *
 * The client, 27 Aug: "when you do create dropdowns, they have to be custom
 * coded dropdowns, not, uh, like the device's default dropdown." A native
 * `<select>` cannot be styled past its box — the list itself is drawn by the
 * OS, so on a phone it is a full-screen grey wheel and on a Mac a system
 * popup, neither of which belongs on this site.
 *
 * The submitted payload is unchanged: a hidden input carries `name` and
 * `value`, so `new FormData(form)` produces exactly what the `<select>` did.
 *
 * Keyboard is the listbox pattern — Enter/Space/Arrow to open, arrows and
 * Home/End to move, Enter to take, Escape to close, blur-out to close.
 */
export default function TcSelect({
  name,
  options,
  defaultValue,
  id,
  ariaLabel,
  className,
}: {
  name: string;
  options: readonly string[];
  defaultValue?: string;
  id?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? options[0] ?? '');
  const [open, setOpen] = useState(false);
  /** Which row the keyboard is on — not the same as the chosen one. */
  const [active, setActive] = useState(() => Math.max(0, options.indexOf(defaultValue ?? '')));
  const wrap = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const auto = useId();
  const listId = (id || auto) + '-list';

  /* Pointer down anywhere else closes it. `mousedown`, not `click`: a click
     that starts inside and ends outside should not count as outside. */
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  /* Keep the active row in view when the arrows walk past the fold. */
  useEffect(() => {
    if (!open || !listRef.current) return;
    const row = listRef.current.children[active] as HTMLElement | undefined;
    row?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const take = (i: number) => {
    const v = options[i];
    if (v == null) return;
    setValue(v);
    setActive(i);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (open) e.stopPropagation();
      setOpen(false);
      return;
    }
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      take(active);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className={'tc-sel' + (open ? ' open' : '') + (className ? ' ' + className : '')} ref={wrap}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        className="tc-sel-t"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
      >
        <span className="tc-sel-v">{value}</span>
        <svg className="tc-sel-c" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1.5 6 6.5 11 1.5" />
        </svg>
      </button>
      <div className="tc-sel-list" id={listId} role="listbox" aria-label={ariaLabel} hidden={!open} ref={listRef}>
        {options.map((o, i) => (
          <div
            key={o}
            role="option"
            aria-selected={o === value}
            className={'tc-sel-o' + (o === value ? ' on' : '') + (i === active ? ' act' : '')}
            onMouseEnter={() => setActive(i)}
            onClick={() => take(i)}
          >
            {o}
          </div>
        ))}
      </div>
    </div>
  );
}
