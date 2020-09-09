import {
  ChangeDetectorRef,
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

import { ObservableInput, ReplaySubject, Subscription, Unsubscribable } from 'rxjs';
import { distinctUntilChanged, switchAll } from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[poc1Switch]'
})
export class Poc1Switch<U> implements OnInit, OnDestroy {
  private subscription: Unsubscribable = new Subscription();
  observables$ = new ReplaySubject(1);
  viewContext = { $implicit: undefined};

  defaultEmbeddedView;

  values$ = this.observables$
    .pipe(
      distinctUntilChanged(),
      switchAll()
    );

  @Input()
  set poc1Switch(potentialObservable: ObservableInput<U> | null | undefined) {
    this.observables$.next(potentialObservable);
  }

  constructor(

  ) {

  }

  ngOnInit() {
    this.subscription = this.values$
      .subscribe(
        v => {

        }
      );
  }

  ngOnDestroy() {
    this.defaultEmbeddedView.destroy();
    this.subscription.unsubscribe();
  }

}