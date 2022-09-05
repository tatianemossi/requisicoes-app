import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../auth/services/authentication.service';
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
    private router: Router,
    private authService: AuthenticationService,
    private toastr: ToastrService,
    private funcionarioService: FuncionarioService,
    private departamentoService: DepartamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      funcionario: new FormGroup({
        id: new FormControl(""),
        nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
        email: new FormControl("", [Validators.required, Validators.email]),
        funcao: new FormControl("", [Validators.required, Validators.minLength(3)]),
        departamentoId: new FormControl("", [Validators.required]),
        departamento: new FormControl("")
      }),
      senha: new FormControl("")
    });

    this.funcionarios$ = this.funcionarioService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id() {
    return this.form.get("funcionario.id");
  }

  get nome() {
    return this.form.get("funcionario.nome")
  }

  get email() {
    return this.form.get("funcionario.email")
  }

  get funcao() {
    return this.form.get("funcionario.funcao")
  }

  get departamentoId() {
    return this.form.get("funcionario.departamentoId")
  }

  get senha() {
    return this.form.get("senha")
  }

  public async gravar(modal: TemplateRef<any>, funcionario?: Funcionario) {
    this.form.reset();

    if (funcionario) {
      const departamento = funcionario.departamento ? funcionario.departamento : null;

      const funcionarioCompleto = {
        ...funcionario,
        departamento
      }

      this.form.get("funcionario")?.setValue(funcionarioCompleto);
    }

    try {
      await this.modalService.open(modal).result;

      if (this.form.dirty && this.form.valid) {
        if (!funcionario) {
          await this.authService.cadastrar(this.email?.value, this.senha?.value);

          await this.funcionarioService.inserir(this.form.get("funcionario")?.value);
          this.toastr.success('Funcionário inserido!', 'Cadastro de Funcionários');

          await this.authService.logout();

          await this.router.navigate(["/login"]);
        }
        else {
          await this.funcionarioService.editar(this.form.get("funcionario")?.value);
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
