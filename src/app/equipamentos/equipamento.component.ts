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
    return this.id?.value ? "Atualização" : "Cadastro"
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

      if (!equipamento){
        await this.equipamentoService.inserir(this.form.value);
        this.showToastr('Equipamento inserido!');
      }
        else {
        await this.equipamentoService.editar(this.form.value);
        this.showToastr('Equipamento editado!');
      }

    } catch (_error) {
    }
  }

  public excluir(equipamento: Equipamento) {
    this.equipamentoService.excluir(equipamento);
    this.showToastr('Equipamento excluído!');
  }

  showToastr(mensagem: string) {
    this.toastr.success(mensagem, 'Sucesso!');
  }
}
