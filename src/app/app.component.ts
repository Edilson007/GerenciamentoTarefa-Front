import { Component, OnInit, TemplateRef } from '@angular/core';
import { TarefaService } from './Tarefas.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Tarefa } from './Tarefa';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { StatusEnum } from './StatusEnum';
import { ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  formulario: any;
  tituloFormulario!: string;
  //tarefas!: Tarefa[];
  titulo!: string;
  tarefaId!: number;

  visibilidadeTabela: boolean = true;
  visibilidadeFormulario: boolean = false;

  modalRef!: BsModalRef;
  statusEnumList = Object.values(StatusEnum);

  tarefas: Tarefa[] = []; // Supondo que você tenha uma interface Tarefa
  tarefa!: Tarefa; // Variável para uma tarefa específica
  isUpdating: boolean = false;

  constructor(private tarefasService: TarefaService,
    private modalService: BsModalService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.tarefasService.obterTarefas().subscribe((resultado) => {
      this.tarefas = resultado;
    });
  }

  ExibirFormularioCadastro(): void {
    this.isUpdating = false;
    this.visibilidadeTabela = false;
    this.visibilidadeFormulario = true;
    this.tituloFormulario = 'Nova Tarefa';
    this.formulario = new FormGroup({
      titulo: new FormControl(null),
      descricao: new FormControl(null),
      dataCriacao: new FormControl(null),
      dataConclusao: new FormControl(null),
      status: new FormControl(null),
    });

  }

  ExibirFormularioAtualizacao(tarefaId: number): void {
    this.isUpdating = true;
    this.visibilidadeTabela = false;
    this.visibilidadeFormulario = true;

    this.tarefasService.obterTarefasId(tarefaId).subscribe((resultado) => {
      this.tituloFormulario = `Atualizar Tarefa - ${resultado.titulo}`;
      console.log(resultado);
      this.formulario = new FormGroup({
        tarefaId: new FormControl(resultado.tarefaId),
        titulo: new FormControl(resultado.titulo),
        descricao: new FormControl(resultado.descricao),
        dataCriacao: new FormControl(this.formatDateAtualizar(resultado.dataCriacao)),
        dataConclusao: new FormControl(this.formatDateAtualizar(resultado.dataConclusao)),
        status: new FormControl(resultado.status),

      });
      if (this.isUpdating) {
        this.formulario.get('dataCriacao')?.disable(); // Desabilita o campo dataCriacao
      }
    });
  }

  EnviarFormulario(): void {
    if (this.isUpdating) {
      this.formulario.get('dataCriacao')?.enable(); // Habilita temporariamente o campo
    }

    const tarefa: Tarefa = this.formulario.getRawValue(); // Cap

    if (tarefa.dataCriacao) {
      tarefa.dataCriacao = this.formatDate(new Date(tarefa.dataCriacao));
    }
    if (tarefa.dataConclusao) {
      tarefa.dataConclusao = this.formatDate(new Date(tarefa.dataConclusao));
    }

    if (tarefa.status) {
      tarefa.status = Number(tarefa.status);
    }

    if (this.isUpdating) {
      this.formulario.get('dataCriacao')?.disable(); // Desabilita novamente o campo após capturar o valor
    }


    if (tarefa.tarefaId > 0) {
      // Atualiza a tarefa
      this.tarefasService.atualizarTarefa(tarefa).subscribe((resultado) => {
        if (resultado) {
          this.visibilidadeFormulario = false;
          this.visibilidadeTabela = true;
          this.cdr.detectChanges();
          alert('Tarefa atualizada com sucesso');
          this.tarefasService.obterTarefas().subscribe((registros) => {
            this.tarefas = registros;
            this.cdr.detectChanges();
          });
        } else {
          const errorMessages = resultado.errors.map((error: { errorMessage: any; }) => error.errorMessage).join('\n');
          this.cdr.detectChanges();
          alert('Erro ao atualizar tarefa:\n' + errorMessages);
          console.log(errorMessages)
        }
      }, (error: HttpErrorResponse) => { // Tipo `any` explicitamente
        const errorMessages = error.error?.errors?.map((err: any) => err.errorMessage).join('\n') || 'Erro desconhecido ao atualizar a tarefa.';
        alert(errorMessages);
      });
    } else {
      // Salva a nova tarefa
      this.tarefasService.salvarTarefa(tarefa).subscribe((resultado) => {
        if (resultado) {
          this.visibilidadeFormulario = false;
          this.visibilidadeTabela = true;
          this.cdr.detectChanges();
          alert('Tarefa inserida com sucesso');
          this.tarefasService.obterTarefas().subscribe((registros) => {
            this.tarefas = registros;
            this.cdr.detectChanges();
          });
        } else {
          const errorMessages = resultado.errors.map((error: { errorMessage: any; }) => error.errorMessage).join('\n');
          this.cdr.detectChanges();
          alert('Erro ao inserir tarefa:\n' + errorMessages);
          console.log(errorMessages)
        }
      }, (error: HttpErrorResponse) => { // Tipo `any` explicitamente
        const errorMessages = error.error?.errors?.map((err: any) => err.errorMessage).join('\n') || 'Erro desconhecido ao salvar a tarefa.';
        alert(errorMessages);
      });
    }


    // if (tarefa.tarefaId > 0) {
    //   this.tarefasService.atualizarTarefa(tarefa).subscribe((resultado) => {
    //     this.visibilidadeFormulario = false;
    //     this.visibilidadeTabela = true;
    //     alert('Tarefa atualizada com sucesso');
    //     this.tarefasService.obterTarefas().subscribe((registros) => {
    //       this.tarefas = registros;
    //     });
    //   });
    // } else {
    //   this.tarefasService.salvarTarefa(tarefa).subscribe((resultado) => {
    //     this.visibilidadeFormulario = false;
    //     this.visibilidadeTabela = true;
    //     alert('Pessoa inserida com sucesso');
    //     this.tarefasService.obterTarefas().subscribe((registros) => {
    //       this.tarefas = registros;
    //     });
    //   });
    // }

  }

  Voltar(): void {
    this.visibilidadeTabela = true;
    this.visibilidadeFormulario = false;
  }

  ExibirConfirmacaoExclusao(tarefaId: number, titulo: string, conteudoModal: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(conteudoModal);
    this.tarefaId = tarefaId;
    this.titulo= titulo;
  }

  ExcluirPessoa(tarefaId: number){
    this.tarefasService.excluirTarefa(tarefaId).subscribe(resultado => {
      this.modalRef.hide();
      alert('Tarefa excluída com sucesso');
      this.tarefasService.obterTarefas().subscribe(registros => {
        this.tarefas = registros;
      });
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 19);
  }

  statusOptions = Object.keys(StatusEnum)
  .filter(key => isNaN(Number(key))) // Filtra apenas os nomes
  .map(key => ({
    value: StatusEnum[key as keyof typeof StatusEnum],
    label: key, // Usa o nome do enum como a descrição
  }));

  getStatusLabel(status: number): string {
    switch (status) {
      case StatusEnum.Pendente:
        return 'Pendente';
      case StatusEnum.EmProgresso:
        return 'Em Progresso';
      case StatusEnum.Concluida:
        return 'Concluída';
      default:
        return 'Status Desconhecido';
    }
  }


  formatDateAtualizar(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // meses começam em 0
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`; // formato YYYY-MM-DD
  }




}





