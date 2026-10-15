import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Language } from '../i18n.model';

/**
 * Decorative inline SVG flag (emoji flags render as "BR"/"US" letters on Windows).
 * Rounded corners come from the wrapper (`overflow: hidden`), so the SVGs need
 * no clipPath ids that could collide between instances.
 */
@Component({
  selector: 'app-flag-icon',
  host: { 'aria-hidden': 'true' },
  template: `
    @switch (lang()) {
      @case ('pt-BR') {
        <svg viewBox="0 0 28 20" width="28" height="20" focusable="false">
          <rect width="28" height="20" fill="#009C3B" />
          <path d="M14 2.5 25.5 10 14 17.5 2.5 10Z" fill="#FFDF00" />
          <circle cx="14" cy="10" r="4.6" fill="#002776" />
          <path d="M9.6 8.9c3-.9 6.3-.6 8.9 1.1l-.3.9c-2.5-1.6-5.6-1.9-8.4-1.1Z" fill="#fff" />
        </svg>
      }
      @case ('en') {
        <svg viewBox="0 0 28 20" width="28" height="20" focusable="false">
          <rect width="28" height="20" fill="#fff" />
          <path
            d="M0 0h28M0 3.08h28M0 6.15h28M0 9.23h28M0 12.3h28M0 15.38h28M0 18.46h28"
            stroke="#B22234"
            stroke-width="1.54"
            transform="translate(0 .77)"
          />
          <rect width="12" height="10.77" fill="#3C3B6E" />
          <g fill="#fff">
            @for (star of stars; track $index) {
              <circle [attr.cx]="star[0]" [attr.cy]="star[1]" r=".6" />
            }
          </g>
        </svg>
      }
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 28px;
      height: 20px;
      overflow: hidden;
      border-radius: 3px;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 12%);
    }
    svg {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagIconComponent {
  readonly lang = input.required<Language>();

  /** Star positions of the simplified 28x20 US flag canton. */
  protected readonly stars: readonly (readonly [number, number])[] = [
    [2, 2],
    [5, 2],
    [8, 2],
    [11, 2],
    [3.5, 4],
    [6.5, 4],
    [9.5, 4],
    [2, 6],
    [5, 6],
    [8, 6],
    [11, 6],
    [3.5, 8],
    [6.5, 8],
    [9.5, 8],
  ];
}
