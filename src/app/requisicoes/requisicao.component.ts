import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Departamento } from '../departamentos/models/departamento.model';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Equipamento } from '../equipamentos/models/equipamento.model';
import { EquipamentoService } from '../equipamentos/services/equipamento.service';
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
  public form: FormGroup;

  constructor(
    private toastr: ToastrService,
    private requisicaoService: RequisicaoService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      requisicao: new FormGroup({
        id: new FormControl(""),
        dataAbertura: new FormControl(""),
        departamentoId: new FormControl("", [Validators.required]),
        departamento: new FormControl(""),
        descricao: new FormControl("", [Validators.required, Validators.minLength(10)]),
        equipamentoId: new FormControl(""),
        equipamento: new FormControl("")
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


  public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao) {
    this.form.reset();

    if (requisicao) {
      const departamento = requisicao.departamento ? requisicao.departamento : null;

      const requisicaoCompleta = {
        ...requisicao,
        departamento
      }

      this.form.get("requisicao")?.setValue(requisicaoCompleta);
    }

    try {
      await this.modalService.open(modal).result;

      if (this.form.dirty && this.form.valid) {
        if (!requisicao) {

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

}
