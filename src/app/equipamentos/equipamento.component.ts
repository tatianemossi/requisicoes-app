import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Equipamento } from './models/equipamento.model';
import { EquipamentoService } from './services/equipamento.service';

@Component({
  selector: 'app-equipamento',
  templateUrl: './equipamento.component.html'
})
export class EquipamentoComponent implements OnInit {
  public equipamentos$: Observable<Equipamento[]>;
  public form: FormGroup;
  public dataFabricacaoMax: Date;

  constructor(
    private toastr: ToastrService,
    private equipamentoService: EquipamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.dataFabricacaoMax = new Date;
    this.equipamentos$ = this.equipamentoService.selecionarTodos();

    this.form = this.fb.group({
      id: new FormControl(""),
      numeroSerie: new FormControl(""),
      nome: new FormControl(""),
      preco: new FormControl(""),
      dataFabricacao: new FormControl("")
    })
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id() {
    return this.form.get("id");
  }

  get numeroSerie() {
    return this.form.get("numeroSerie")
  }

  get nome() {
    return this.form.get("nome")
  }

  get preco() {
    return this.form.get("preco")
  }

  get dataFabricacao() {
    return this.form.get("dataFabricacao")
  }

  public async gravar(modal: TemplateRef<any>, equipamento?: Equipamento) {
    this.form.reset();

    if (equipamento)
      this.form.setValue(equipamento);

    try {
      await this.modalService.open(modal).result;

      if (!equipamento) {
        await this.equipamentoService.inserir(this.form.value);
        this.toastr.success('Equipamento inserido!', 'Cadastro de Equipamentos');
      }
      else {
        await this.equipamentoService.editar(this.form.value);
        this.toastr.success('Equipamento editado!', 'Cadastro de Equipamentos');
      }

    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Houve um erro ao salvar o equipamento!', 'Cadastro de Equipamentos');
    }
  }

  public excluir(equipamento: Equipamento) {
    try {
      this.equipamentoService.excluir(equipamento);
      this.toastr.success('Equipamento excluído!', 'Cadastro de Equipamentos');
    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastr.error('Houve um erro ao excluir o equipamento!', 'Cadastro de Equipamentos');
    }
  }
}
