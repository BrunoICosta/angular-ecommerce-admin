import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { BehaviorSubject, combineLatest, filter, switchMap } from 'rxjs';

/**
 * Route `title`s are translation keys (e.g. `titles.products`). The document
 * title is rebuilt when the route or the language changes.
 */
@Injectable()
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private readonly key$ = new BehaviorSubject<string | null>(null);

  constructor() {
    super();
    combineLatest([this.key$, this.transloco.langChanges$])
      .pipe(
        filter((pair): pair is [string, string] => pair[0] !== null),
        switchMap(([key]) =>
          combineLatest([
            this.transloco.selectTranslate(key),
            this.transloco.selectTranslate('app.name'),
          ]),
        ),
      )
      .subscribe(([page, app]) => this.title.setTitle(`${page} · ${app}`));
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    if (key) this.key$.next(key);
  }
}
