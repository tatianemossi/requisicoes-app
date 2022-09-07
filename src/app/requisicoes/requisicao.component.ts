import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { filter, map, Observable, Subscription } from 'rxjs';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Departamento } from '../departamentos/models/departamento.model';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Equipamento } from '../equipamentos/models/equipamento.model';
import { EquipamentoService } from '../equipamentos/services/equipamento.service';
import { Funcionario } from '../funcionarios/models/funcionario.model';
import { FuncionarioService } from '../funcionarios/services/funcionario.service';
import { Requisicao } from './models/requisicao.model';
import { RequisicaoService } from './services/requisicao.service';

@Component({
  selector: 'app-requisicao',
  templateUrl: './requisicao.component.html'
})
export class RequisicaoComponent implements OnInit {
  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;
  funcionarioLogado: Funcionario;
  emailUsuario?: string | null;
  usuarioLogado$: Subscription;
  public form: FormGroup;

  constructor(
    private toastr: ToastrService,
    private authService: AuthenticationService,
    private requisicaoService: RequisicaoService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,
    private funcionarioService: FuncionarioService,
    private modalService: NgbModal,
    private fb: FormBuilder) { }

  ngOnInit(): void {

    this.usuarioLogado$ = this.authService.usuarioLogado
      .subscribe(usuario => {
        this.emailUsuario = usuario?.email;
        this.obterFuncionaLogado(usuario?.email);
        this.requisicoes$ = this.requisicoes$.pipe(map(req => req.filter(r => r.funcionarioId === this.funcionarioLogado.id)));
      });

    this.form = this.fb.group({
      requisicao: new FormGroup({
        id: new FormControl(""),
        dataAbertura: new FormControl(moment()),
        departamentoId: new FormControl("", [Validators.required]),
        departamento: new FormControl(""),
        descricao: new FormControl("", [Validators.required, Validators.minLength(10)]),
        equipamentoId: new FormControl(""),
        equipamento: new FormControl(""),
        funcionarioId: new FormControl(""),
        funcionario: new FormControl("")
      })
    });

    this.requisicoes$ = this.requisicaoService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id() {
    return this.form.get("requisicao.id");
  }

  get dataAbertura() {
    return this.form.get("requisicao.dataAbertura")
  }

  get departamentoId() {
    return this.form.get("requisicao.departamentoId")
  }

  get descricao() {
    return this.form.get("requisicao.descricao")
  }

  get equipamentoId() {
    return this.form.get("requisicao.equipamentoId")
  }

  get funcionarioId() {
    return this.form.get("requisicao.funcionarioId")
  }

  public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao) {
    this.form.reset();

    if (requisicao) {
      const departamento = requisicao.departamento ? requisicao.departamento : null;
      const equipamento = requisicao.equipamento ? requisicao.equipamento : null;
      const funcionario = requisicao.funcionario ? requisicao.funcionario : null;

      const requisicaoCompleta = {
        ...requisicao,
        departamento,
        equipamento,
        funcionario
      }
      this.form.get("requisicao")?.setValue(requisicaoCompleta);
    }

    try {
      await this.modalService.open(modal).result;

      if (this.form.dirty && this.form.valid) {
        if (!requisicao) {
          this.form.get("requisicao.funcionarioId")?.setValue(this.funcionarioLogado.id);
          await this.requisicaoService.inserir(this.form.get("requisicao")?.value);
          this.toastr.success('Requisição inserida!', 'Cadastro de Requisições');
        }
        else {
          await this.requisicaoService.editar(this.form.get("requisicao")?.value);
          this.toastr.success('Requisição editada!', 'Cadastro de Requisições');
        }
      }
      else
        this.toastr.error('O formulário precisa ser preenchido!', 'Cadastro de Requisições');

    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Houve um erro ao salvar o funcionário!', 'Cadastro de Requisições');
    }
  }

  public excluir(requisicao: Requisicao) {
    try {
      this.requisicaoService.excluir(requisicao);
      this.toastr.success('Requisição excluída!', 'Cadastro de Requisições');
    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Houve um erro ao excluir a requisição!', 'Cadastro de Requisições');
    }
  }

  public obterFuncionaLogado(emailUsuario: string | null | undefined) {
    this.funcionarioService.selecionarFuncionarioLogado(emailUsuario)
      .subscribe(funcionario => {
        this.funcionarioLogado = funcionario;
      })
  }
}
