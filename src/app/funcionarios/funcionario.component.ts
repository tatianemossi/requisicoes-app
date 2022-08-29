import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Funcionario } from './models/funcionario.model';
import { FuncionarioService } from './services/funcionario.service';

@Component({
  selector: 'app-funcionario',
  templateUrl: './funcionario.component.html'
})
export class FuncionarioComponent implements OnInit {
  public funcionarios$: Observable<Funcionario[]>;
  public form: FormGroup;

  constructor(
    private funcionarioService: FuncionarioService,
    private modalService: NgbModal,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.funcionarios$ = this.funcionarioService.selecionarTodos();

    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl(""),
      funcao: new FormControl(""),
      email: new FormControl(""),
      departamento: new FormControl("")
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

  get funcao() {
    return this.form.get("funcao");
  }

  get email() {
    return this.form.get("email");
  }

  public async gravar(modal: TemplateRef<any>, funcionario?: Funcionario) {
    this.form.reset();

    if (funcionario)
      this.form.setValue(funcionario);

    try {
      await this.modalService.open(modal).result;

      if (!funcionario)
        await this.funcionarioService.inserir(this.form.value);
      else
        await this.funcionarioService.editar(this.form.value);

      console.log("o funcionário foi salvo com sucesso!")

    } catch (_error) {
    }
  }

  public excluir(funcionario: Funcionario) {
    this.funcionarioService.excluir(funcionario);
  }
}
