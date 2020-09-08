import {
  ChangeDetectorRef,
  Directive,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

import { Observable, ObservableInput, ReplaySubject, Subscription, Unsubscribable } from 'rxjs';
import { distinctUntilChanged, switchAll } from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[pocFor]'
})
export class PocForDirective<U> implements OnInit, OnDestroy {
  observables$ = new ReplaySubject(1);
  embeddedViews: Map<U, { view: EmbeddedViewRef<any>, item: any }> = new Map();

  values$: Observable<U[]> = this.observables$.pipe(
      distinctUntilChanged(),
      switchAll()
    );

  @Input()
  set pocFor(potentialObservable: ObservableInput<U> | null | undefined) {
    this.observables$.next(potentialObservable);
  }

  _pocForTrackBy;
  @Input()
  set pocForTrackBy(key: string) {
    this._pocForTrackBy = key;
  }

  private subscription: Unsubscribable = new Subscription();

  constructor(
    private cdRef: ChangeDetectorRef,
    private readonly templateRef: TemplateRef<{ $implicit: U }>,
    private readonly viewContainerRef: ViewContainerRef
  ) {

  }

  ngOnInit() {
    this.subscription = this.values$
      .subscribe(
        arr => arr.forEach(this.updateItem)
      );
  }

  updateItem = (item, idx): void => {
    const key = item[this._pocForTrackBy];
    let existingItem = this.embeddedViews.has(key) ? this.embeddedViews.get(key) : undefined;
    if (!existingItem) {
      const view = this.viewContainerRef
        .createEmbeddedView(this.templateRef, { $implicit: item }, idx);
      existingItem = { view, item};
      this.embeddedViews.set(key, existingItem);

    } else {
      existingItem.view.context.$implicit = item;
    }
    existingItem.view.detectChanges();
  }

  ngOnDestroy() {
    this.viewContainerRef.clear();
    this.subscription.unsubscribe();
  }

}
