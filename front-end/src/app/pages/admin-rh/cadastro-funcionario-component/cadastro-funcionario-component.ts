import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro-funcionario-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro-funcionario-component.html',
  styleUrl: './cadastro-funcionario-component.css'
})
export class CadastroFuncionarioComponent {

  @ViewChild('inputArquivo') inputArquivo!: ElementRef<HTMLInputElement>;

  formulario: FormGroup;

  arrastandoArquivo = false;
  previewFoto: string | ArrayBuffer | null = null;
  erroFoto = '';

  senhaVisivel = false;

  cargos = ['Analista', 'Assistente', 'Desenvolvedor(a)', 'Coordenador(a)', 'Gerente', 'Diretor(a)'];
  setores = ['Recursos Humanos', 'Tecnologia da Informação', 'Financeiro', 'Comercial', 'Operações'];
  estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'];
  tiposVinculo = ['CLT', 'PJ', 'Estágio', 'Temporário', 'Aprendiz'];
  gestores = ['Ana Ribeiro', 'Bruno Castro', 'Carla Menezes', 'Diego Fontes'];
  locaisTrabalho = ['Matriz - São Paulo', 'Filial - Rio de Janeiro', 'Home Office', 'Híbrido'];
  tiposAcesso = ['Funcionário', 'Gestor', 'RH / Administrador'];

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.formulario = this.formBuilder.group({
      nomeCompleto: ['', Validators.required],
      emailCorporativo: ['', [Validators.required, Validators.email]],
      cpf: ['', Validators.required],
      telefone: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      estadoCivil: [''],
      nacionalidade: ['Brasileira'],
      naturalidade: [''],

      matricula: ['', Validators.required],
      cargo: ['', Validators.required],
      setor: ['', Validators.required],
      dataAdmissao: ['', Validators.required],
      tipoVinculo: ['', Validators.required],
      cargaHorariaSemanal: [''],
      gestorImediato: [''],
      localTrabalho: [''],

      tipoAcesso: ['', Validators.required],
      status: ['Ativo', Validators.required],
      senhaProvisoria: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get f() {
    return this.formulario.controls;
  }

  abrirSeletorArquivo(): void {
    this.inputArquivo.nativeElement.click();
  }

  aoSelecionarArquivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processarArquivo(input.files[0]);
    }
  }

  aoSoltarArquivo(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastandoArquivo = false;
    if (evento.dataTransfer?.files && evento.dataTransfer.files.length > 0) {
      this.processarArquivo(evento.dataTransfer.files[0]);
    }
  }

  aoArrastarSobre(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastandoArquivo = true;
  }

  aoSairArraste(): void {
    this.arrastandoArquivo = false;
  }

  private processarArquivo(arquivo: File): void {
    const formatosAceitos = ['image/jpeg', 'image/png'];
    const tamanhoMaximoBytes = 2 * 1024 * 1024;

    if (!formatosAceitos.includes(arquivo.type)) {
      this.erroFoto = 'Formato inválido. Envie um arquivo JPG ou PNG.';
      return;
    }

    if (arquivo.size > tamanhoMaximoBytes) {
      this.erroFoto = 'O arquivo excede o tamanho máximo de 2MB.';
      return;
    }

    this.erroFoto = '';
    const leitor = new FileReader();
    leitor.onload = () => (this.previewFoto = leitor.result);
    leitor.readAsDataURL(arquivo);
  }

  removerFoto(): void {
    this.previewFoto = null;
    this.erroFoto = '';
    this.inputArquivo.nativeElement.value = '';
  }

  alternarVisibilidadeSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  gerarSenha(): void {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let senha = '';
    for (let i = 0; i < 10; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    this.formulario.patchValue({ senhaProvisoria: senha });
    this.senhaVisivel = true;
  }

  cancelar(): void {
    this.router.navigate(['/gestao/funcionarios']);
  }

  limparFormulario(): void {
    this.formulario.reset({
      nacionalidade: 'Brasileira',
      status: 'Ativo'
    });
    this.removerFoto();
  }

  salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const novoFuncionario = this.formulario.value;
    console.log('Novo funcionário cadastrado:', novoFuncionario);
    this.router.navigate(['/gestao/funcionarios']);
  }
}