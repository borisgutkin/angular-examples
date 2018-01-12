import {Directive, HostListener} from '@angular/core';
import {DialogService} from '../services/dialog.service';

@Directive({
  selector: '[appPrompt]'
})
export class PromptDirective {

  constructor(private dialog: DialogService) { }

  @HostListener('change') formChanged() {
      // this.dialog.state = false;
      this.dialog.prompt.emit(false);
  }

  @HostListener('submit') formSubmitted() {
      // this.dialog.state = true;
      this.dialog.prompt.emit(true);
  }

  @HostListener('click', ['$event']) cancelled(event) {
      if (event.target.className.indexOf('button') > -1) {
          this.dialog.prompt.emit(true);
          // this.dialog.state = true;
      }
  }

}
