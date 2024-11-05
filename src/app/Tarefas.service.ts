import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Tarefa } from './Tarefa';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
     'Content-Type' : 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class TarefaService {
  url = 'https://localhost:7220/api/tarefas';

  constructor(private http: HttpClient)
  { }

  obterTarefas(): Observable<Tarefa[]>{
    return this.http.get<Tarefa[]>(this.url);
  }

  obterTarefasId(tarefaId: number): Observable<Tarefa>{
    const apiUrl = `${this.url}/${tarefaId}`;
    return this.http.get<Tarefa>(apiUrl);
  }

  salvarTarefa(tarefa: Tarefa): Observable<any> {
    return this.http.post<Tarefa>(this.url, tarefa, httpOptions);
  }

  atualizarTarefa(tarefa: Tarefa) : Observable<any> {
    return this.http.put<Tarefa>(this.url, tarefa, httpOptions);
  }

  excluirTarefa(tarefaId: number) : Observable<any> {
    const apiUrl = `${this.url}/${tarefaId}`
    return this.http.delete<number>(apiUrl, httpOptions);
  }

}
