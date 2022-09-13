import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { Departamento } from 'src/app/departamentos/models/departamento.model';
import { DepartamentoService } from 'src/app/departamentos/services/departamento.service';
import { Equipamento } from 'src/app/equipamentos/models/equipamento.model';
import { EquipamentoService } from 'src/app/equipamentos/services/equipamento.service';
import { FuncionarioService } from 'src/app/funcionarios/services/funcionario.service';
import { Requisicao } from '../models/requisicao.model';
import { RequisicaoService } from '../services/requisicao.service';

@Component({
  selector: 'app-requisicoes-funcionario',
  templateUrl: './requisicoes-funcionario.component.html'
})
export class RequisicoesFuncionarioComponent implements OnInit {
  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;
  public funcionarioLogadoId: string;
  public form: FormGroup;
  private processoAutenticado$: Subscription;

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
    this.form = this.fb.group({
      requisicao: new FormGroup({
        id: new FormControl(""),
        descricao: new FormControl(""),
        dataAbertura: new FormControl(""),

        departamentoId: new FormControl(""),
        departamento: new FormControl(""),

        equipamentoId: new FormControl(""),
        equipamento: new FormControl(""),

        funcionarioId: new FormControl(""),
        funcionario: new FormControl(""),

        status: new FormControl(""),
        ultimaAtualizacao: new FormControl(""),
        movimentacoes: new FormControl(""),
      })
    });

    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();

    this.authService.usuarioLogado.subscribe(usuario => {
      const email: string = usuario?.email!;

      this.funcionarioService.selecionarFuncionarioLogado(email)
        .subscribe(funcionario => {
          this.funcionarioLogadoId = funcionario.id;
          this.requisicoes$ = this.requisicaoService.selecionarRequisicoesPeloFuncionarioAtual(this.funcionarioLogadoId);
        });
    })
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
    this.form.get("requisicao.dataAbertura")?.setValue(new Date());
    this.form.get("requisicao.ultimaAtualizacao")?.setValue(new Date());
    this.form.get("requisicao.equipamentoId")?.setValue(null);
    this.form.get("requisicao.funcionarioId")?.setValue(null);

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
          this.form.get("requisicao.funcionarioId")?.setValue(this.funcionarioLogadoId);
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
        this.toastr.error('Houve um erro ao salvar a Requisição!', 'Cadastro de Requisições');
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

}
