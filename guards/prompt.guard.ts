import { Component, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { DialogService } from '../services/dialog.service';

@Injectable()
export class PromptGuard implements CanDeactivate<Component> {

  constructor(private dialog: DialogService) { }

  canDeactivate(component: Component,
                r: ActivatedRouteSnapshot,
                s: RouterStateSnapshot,
                n: RouterStateSnapshot) {
      return this.dialog.checkState(n);
  }
}
