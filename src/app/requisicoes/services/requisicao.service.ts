import _default from '@angular/common/locales/pt';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map, Observable, take } from 'rxjs';
import { Departamento } from 'src/app/departamentos/models/departamento.model';
import { Equipamento } from 'src/app/equipamentos/models/equipamento.model';
import { Funcionario } from 'src/app/funcionarios/models/funcionario.model';
import { Requisicao } from '../models/requisicao.model';

@Injectable({
  providedIn: 'root'
})
export class RequisicaoService {
  private registros: AngularFirestoreCollection<Requisicao>;

  constructor(private firestore: AngularFirestore) {
    this.registros = this.firestore.collection<Requisicao>("requisicoes")
  }

  public async inserir(registro: Requisicao): Promise<any> {
    if (!registro)
      return Promise.reject("Item inválido");

    const res = await this.registros.add(registro);

    registro.id = res.id;
    this.registros.doc(res.id).set(registro);
  }

  public async editar(registro: Requisicao): Promise<void> {
    return this.registros.doc(registro.id).set(registro);
  }

  public excluir(registro: Requisicao): Promise<void> {
    return this.registros.doc(registro.id).delete();
  }

  public selecionarTodos(): Observable<Requisicao[]> {
    return this.registros.valueChanges()
      .pipe(
        map((requisicoes: Requisicao[]) => {
          requisicoes.forEach(requisicao => {
            this.firestore
              .collection<Departamento>("departamentos")
              .doc(requisicao.departamentoId)
              .valueChanges()
              .subscribe(d => requisicao.departamento = d);

            this.firestore
              .collection<Funcionario>("funcionarios")
              .doc(requisicao.funcionarioId)
              .valueChanges()
              .subscribe(f => requisicao.funcionario = f);

            if (requisicao.equipamentoId) {
              this.firestore
                .collection<Equipamento>("equipamentos")
                .doc(requisicao.equipamentoId)
                .valueChanges()
                .subscribe(x => requisicao.equipamento = x);
            }
          });

          return requisicoes;
        })
      )
  }

  public selecionarPorId(id: string): Observable<Requisicao> {
    return this.selecionarTodos()
      .pipe(
        take(1),
        map(requisicoes => {
          return requisicoes.filter(requisicao => requisicao.id === id)[0];
        })
      );
  }
}
