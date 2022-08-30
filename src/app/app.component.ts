import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'requisicoes-app';

  constructor(
    private toastr: ToastrService) {}

    showToastr() {
      this.toastr.success('Suuuucesso!', 'Mensagem de Sucesso')
    }
}
