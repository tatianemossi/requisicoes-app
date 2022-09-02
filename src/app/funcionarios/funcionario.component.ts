import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Departamento } from '../departamentos/models/departamento.model';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Funcionario } from './models/funcionario.model';
import { FuncionarioService } from './services/funcionario.service';

@Component({
  selector: 'app-funcionario',
  templateUrl: './funcionario.component.html'
})
export class FuncionarioComponent implements OnInit {
  public funcionarios$: Observable<Funcionario[]>;
  public departamentos$: Observable<Departamento[]>;
  public form: FormGroup;

  constructor(
    private toastr: ToastrService,
    private funcionarioService: FuncionarioService,
    private departamentoService: DepartamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
      email: new FormControl("", [Validators.required, Validators.email]),
      funcao: new FormControl("", [Validators.required, Validators.minLength(3)]),
      departamentoId: new FormControl("", [Validators.required]),
      departamento: new FormControl("")
    });

    this.funcionarios$ = this.funcionarioService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id() {
    return this.form.get("id");
  }

  get nome() {
    return this.form.get("nome")
  }

  get email() {
    return this.form.get("email")
  }

  get funcao() {
    return this.form.get("funcao")
  }

  get departamentoId() {
    return this.form.get("departamentoId")
  }

  get departamento() {
    return this.form.get("departamento")
  }

  public async gravar(modal: TemplateRef<any>, funcionario?: Funcionario) {
    this.form.reset();

    if (funcionario) {
      const departamento = funcionario.departamento ? funcionario.departamento : null;

      const funcionarioCompleto = {
        ...funcionario,
        departamento
      }

      this.form.setValue(funcionarioCompleto);
    }

    try {
      await this.modalService.open(modal).result;

      if (this.form.dirty && this.form.valid) {
        if (!funcionario) {
          await this.funcionarioService.inserir(this.form.value);
          this.toastr.success('Funcionário inserido!', 'Cadastro de Funcionários');
        }
        else {
          await this.funcionarioService.editar(this.form.value);
          this.toastr.success('Funcionário editado!', 'Cadastro de Funcionários');
        }
      }
      else
        this.toastr.error('O formulário precisa ser preenchido!', 'Cadastro de Funcionários');

    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Houve um erro ao salvar o funcionário!', 'Cadastro de Funcionários');
    }
  }

  public excluir(funcionario: Funcionario) {
    try {
      this.funcionarioService.excluir(funcionario);
      this.toastr.success('Funcionário excluído!', 'Cadastro de Funcionários');
    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Houve um erro ao excluir o funcionário!', 'Cadastro de Funcionários');
    }
  }
}
