import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Departamento } from './models/departamento.model';
import { DepartamentoService } from './services/departamento.service';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html'
})
export class DepartamentoComponent implements OnInit {
  public departamentos$: Observable<Departamento[]>;
  public form: FormGroup;

  constructor(
    private toastr: ToastrService,
    private departamentoService: DepartamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.departamentos$ = this.departamentoService.selecionarTodos();

    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
      telefone: new FormControl("", [Validators.required, Validators.pattern("^[1-9]{2}[0-9]{4,5}[0-9]{4}$")])
    })
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro"
  }

  get id() {
    return this.form.get("id");
  }

  get nome() {
    return this.form.get("nome");
  }

  get telefone() {
    return this.form.get("telefone");
  }

  public async gravar(modal: TemplateRef<any>, departamento?: Departamento) {
    this.form.reset();

    if (departamento)
      this.form.setValue(departamento);

    try {
      await this.modalService.open(modal).result;

      if (this.form.dirty && this.form.valid) {
        if (!departamento) {
          await this.departamentoService.inserir(this.form.value);
          this.toastr.success('Departamento inserido!', 'Cadastro de Departamentos');
        }
        else {
          await this.departamentoService.editar(this.form.value);
          this.toastr.success('Departamnento editado!', 'Cadastro de Departamentos');
        }
      }
      else
        this.toastr.error('O formulário precisa ser preenchido!', 'Cadastro de Departamentos');

    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Houve um erro ao salvar o departamento!', 'Cadastro de Departamentos')
    }
  }

  public excluir(departamento: Departamento) {
    try {
      this.departamentoService.excluir(departamento);
      this.toastr.success('Departamento excluído!', 'Cadastro de Departamentos');
    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Houve um erro ao excluir departamento!', 'Cadastro de Departamentos')
    }
  }
}
