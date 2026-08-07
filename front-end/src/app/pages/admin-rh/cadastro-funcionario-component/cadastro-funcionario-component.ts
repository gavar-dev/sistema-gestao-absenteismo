import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

import { FuncionarioService } from '../../../core/services/funcionario';
import { UsuarioLogadoService } from '../../../core/services/usuario-logado.service';
import {
  FuncionarioCreateRequest,
  FuncionarioResponse,
  StatusFuncionario,
  TipoVinculo,
} from '../../../models/funcionario';
import { TipoUsuario } from '../../../models/tipoUsuario';

interface OpcaoAcesso {
  valor: TipoUsuario;
  rotulo: string;
}

@Component({
  selector: 'app-cadastro-funcionario-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl:
    './cadastro-funcionario-component.html',
  styleUrl:
    './cadastro-funcionario-component.css',
})
export class CadastroFuncionarioComponent
  implements OnInit {

  @ViewChild('inputArquivo')
  inputArquivo?:
    ElementRef<HTMLInputElement>;


  readonly formulario: FormGroup;

  arrastandoArquivo = false;
  previewFoto:
    string | ArrayBuffer | null = null;
  fotoSelecionada: File | null = null;
  erroFoto = '';


  senhaVisivel = false;
  salvando = false;
  erroCadastro = '';
  mensagemSucesso = '';

  readonly cargos = [
    'Analista',
    'Assistente',
    'Desenvolvedor(a)',
    'Coordenador(a)',
    'Gerente',
    'Diretor(a)',
  ];

  readonly setores = [
    'Recursos Humanos',
    'Tecnologia da Informação',
    'Financeiro',
    'Comercial',
    'Operações',
  ];

  readonly estadosCivis = [
    'Solteiro(a)',
    'Casado(a)',
    'Divorciado(a)',
    'Viúvo(a)',
    'União estável',
  ];

  readonly tiposVinculo:
    TipoVinculo[] = [
      'CLT',
      'PJ',
      'Estágio',
      'Temporário',
      'Aprendiz',
    ];

  readonly gestores = [
    'Ana Ribeiro',
    'Bruno Castro',
    'Carla Menezes',
    'Diego Fontes',
  ];

  readonly locaisTrabalho = [
    'Matriz - São Paulo',
    'Filial - Rio de Janeiro',
    'Home Office',
    'Híbrido',
  ];

  readonly tiposAcesso:
    OpcaoAcesso[] = [
      {
        valor: 'funcionario',
        rotulo: 'Funcionário',
      },
      {
        valor: 'gestor',
        rotulo: 'Gestor',
      },
      {
        valor: 'rh',
        rotulo: 'RH / Administrador',
      },
    ];

  readonly statusDisponiveis:
    StatusFuncionario[] = [
      'Ativo',
      'Férias',
      'Afastado',
      'Inativo',
    ];

  constructor(
    private readonly formBuilder:
      FormBuilder,

    private readonly router:
      Router,

    private readonly funcionarioService:
      FuncionarioService,

    private readonly usuarioLogadoService:
      UsuarioLogadoService
  ) {
    this.formulario =
      this.formBuilder.group({
        nomeCompleto: [
          '',
          [
            Validators.required,
            Validators.maxLength(150),
          ],
        ],

        emailCorporativo: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.maxLength(150),
          ],
        ],

        cpf: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/
            ),
          ],
        ],

        telefone: [
          '',
          [
            Validators.required,
            Validators.maxLength(20),
          ],
        ],

        dataNascimento: [
          '',
          Validators.required,
        ],

        estadoCivil: [
          '',
          Validators.maxLength(40),
        ],

        nacionalidade: [
          'Brasileira',
          [
            Validators.required,
            Validators.maxLength(60),
          ],
        ],

        naturalidade: [
          '',
          Validators.maxLength(80),
        ],

        matricula: [
          '',
          [
            Validators.required,
            Validators.maxLength(30),
          ],
        ],

        cargo: [
          '',
          [
            Validators.required,
            Validators.maxLength(100),
          ],
        ],

        setor: [
          '',
          [
            Validators.required,
            Validators.maxLength(100),
          ],
        ],

        dataAdmissao: [
          '',
          Validators.required,
        ],

        tipoVinculo: [
          '',
          Validators.required,
        ],

        cargaHorariaSemanal: [
          null,
          [
            Validators.min(1),
            Validators.max(60),
          ],
        ],

        gestorImediato: [
          '',
          Validators.maxLength(150),
        ],

        localTrabalho: [
          '',
          Validators.maxLength(120),
        ],

        tipoAcesso: [
          'funcionario',
          Validators.required,
        ],

        status: [
          'Ativo',
          Validators.required,
        ],

        senhaProvisoria: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(72),
          ],
        ],
      });
  }

  ngOnInit(): void {
    if (
      this.usuarioLogadoService
        .obterTipoUsuario() !== 'rh'
    ) {
      void this.router.navigate(
        ['/gestao/funcionarios']
      );
    }
  }

  get f(): {
    [key: string]: AbstractControl;
  } {
    return this.formulario.controls;
  }

  campoInvalido(nome: string): boolean {
    const campo =
      this.formulario.get(nome);

    return Boolean(
      campo &&
      campo.invalid &&
      (campo.touched || campo.dirty)
    );
  }

  abrirSeletorArquivo(): void {
    this.inputArquivo
      ?.nativeElement.click();
  }

  aoSelecionarArquivo(
    evento: Event
  ): void {
    const input =
      evento.target as HTMLInputElement;

    const arquivo =
      input.files?.[0];

    if (arquivo) {
      this.processarArquivo(arquivo);
    }
  }

  aoSoltarArquivo(
    evento: DragEvent
  ): void {
    evento.preventDefault();
    this.arrastandoArquivo = false;

    const arquivo =
      evento.dataTransfer
        ?.files?.[0];

    if (arquivo) {
      this.processarArquivo(arquivo);
    }
  }

  aoArrastarSobre(
    evento: DragEvent
  ): void {
    evento.preventDefault();
    this.arrastandoArquivo = true;
  }

  aoSairArraste(): void {
    this.arrastandoArquivo = false;
  }

  removerFoto(): void {
    this.previewFoto = null;
    this.fotoSelecionada = null;
    this.erroFoto = '';

    if (this.inputArquivo) {
      this.inputArquivo
        .nativeElement.value = '';
    }
  }

  alternarVisibilidadeSenha(): void {
    this.senhaVisivel =
      !this.senhaVisivel;
  }

  gerarSenha(): void {
    const caracteres =
      'ABCDEFGHJKLMNPQRSTUVWXYZ' +
      'abcdefghijkmnpqrstuvwxyz' +
      '23456789!@#$%';

    let senha = '';

    for (
      let indice = 0;
      indice < 12;
      indice += 1
    ) {
      const posicao =
        Math.floor(
          Math.random() *
          caracteres.length
        );

      senha +=
        caracteres.charAt(posicao);
    }

    const campoSenha =
      this.formulario.get(
        'senhaProvisoria'
      );

    campoSenha?.setValue(senha);
    campoSenha?.markAsDirty();
    campoSenha?.markAsTouched();
    campoSenha?.updateValueAndValidity();

    this.senhaVisivel = true;
  }

  cancelar(): void {
    if (this.salvando) {
      return;
    }

    void this.router.navigate(
      ['/gestao/funcionarios']
    );
  }

  limparFormulario(): void {
    if (this.salvando) {
      return;
    }

    this.formulario.reset({
      nacionalidade: 'Brasileira',
      tipoAcesso: 'funcionario',
      status: 'Ativo',
      cargaHorariaSemanal: null,
    });

    this.erroCadastro = '';
    this.mensagemSucesso = '';
    this.removerFoto();
  }

  salvar(): void {
    if (this.salvando) {
      return;
    }

    this.erroCadastro = '';
    this.mensagemSucesso = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();

      this.erroCadastro =
        'Revise os campos obrigatórios e os valores informados.';

      return;
    }

    const request =
      this.criarRequest();

    this.salvando = true;

    this.funcionarioService
      .criar(
        request,
        this.fotoSelecionada
      )
      .pipe(timeout(30000))
      .subscribe({
        next: (
          funcionario:
            FuncionarioResponse
        ) => {
          this.mensagemSucesso =
            `${funcionario.nomeCompleto} foi cadastrado com sucesso.`;

          this.salvando = false;

          window.setTimeout(
            () => {
              void this.router.navigate(
                ['/gestao/funcionarios']
              );
            },
            900
          );
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao cadastrar funcionário:',
            erro
          );

          this.erroCadastro =
            this.obterMensagemErro(
              erro,
              'Não foi possível cadastrar o funcionário.'
            );

          this.salvando = false;
        },
      });
  }

  private criarRequest():
    FuncionarioCreateRequest {

    const valor =
      this.formulario.getRawValue();

    return {
      nomeCompleto:
        String(
          valor.nomeCompleto
        ).trim(),

      emailCorporativo:
        String(
          valor.emailCorporativo
        ).trim(),

      cpf:
        String(valor.cpf).trim(),

      telefone:
        String(valor.telefone).trim(),

      dataNascimento:
        String(
          valor.dataNascimento
        ),

      estadoCivil:
        this.valorOpcional(
          valor.estadoCivil
        ),

      nacionalidade:
        String(
          valor.nacionalidade
        ).trim(),

      naturalidade:
        this.valorOpcional(
          valor.naturalidade
        ),

      matricula:
        String(
          valor.matricula
        ).trim(),

      cargo:
        String(valor.cargo).trim(),

      setor:
        String(valor.setor).trim(),

      dataAdmissao:
        String(
          valor.dataAdmissao
        ),

      tipoVinculo:
        valor.tipoVinculo as TipoVinculo,

      cargaHorariaSemanal:
        valor.cargaHorariaSemanal ===
          null ||
        valor.cargaHorariaSemanal ===
          ''
          ? null
          : Number(
              valor
                .cargaHorariaSemanal
            ),

      gestorImediato:
        this.valorOpcional(
          valor.gestorImediato
        ),

      localTrabalho:
        this.valorOpcional(
          valor.localTrabalho
        ),

      tipoAcesso:
        valor.tipoAcesso as TipoUsuario,

      status:
        valor.status as StatusFuncionario,

      senhaProvisoria:
        String(
          valor.senhaProvisoria
        ),
    };
  }

  private valorOpcional(
    valor: unknown
  ): string | null {
    const texto =
      String(valor ?? '').trim();

    return texto || null;
  }

  private processarArquivo(
    arquivo: File
  ): void {
    const formatosAceitos = [
      'image/jpeg',
      'image/png',
    ];

    const tamanhoMaximoBytes =
      2 * 1024 * 1024;

    if (
      !formatosAceitos.includes(
        arquivo.type
      )
    ) {
      this.erroFoto =
        'Formato inválido. Envie um arquivo JPG ou PNG.';

      return;
    }

    if (
      arquivo.size >
      tamanhoMaximoBytes
    ) {
      this.erroFoto =
        'O arquivo excede o tamanho máximo de 2 MB.';

      return;
    }

    this.erroFoto = '';
    this.fotoSelecionada = arquivo;

    const leitor =
      new FileReader();

    leitor.onload = () => {
      this.previewFoto =
        leitor.result;
    };

    leitor.readAsDataURL(arquivo);
  }

  private obterMensagemErro(
    erro: unknown,
    mensagemPadrao: string
  ): string {
    if (
      erro instanceof
      HttpErrorResponse
    ) {
      if (erro.status === 0) {
        return (
          'Não foi possível conectar ao servidor.'
        );
      }

      if (erro.status === 403) {
        return (
          'Apenas usuários do RH podem cadastrar funcionários.'
        );
      }

      if (
        typeof erro.error?.mensagem ===
        'string'
      ) {
        return erro.error.mensagem;
      }

      if (
        typeof erro.error?.message ===
        'string'
      ) {
        return erro.error.message;
      }

      if (
        typeof erro.error?.erro ===
        'string'
      ) {
        return erro.error.erro;
      }

      if (
        typeof erro.error === 'string'
      ) {
        return erro.error;
      }
    }

    if (
      typeof erro === 'object' &&
      erro !== null &&
      'name' in erro &&
      erro.name === 'TimeoutError'
    ) {
      return (
        'O servidor demorou muito para responder.'
      );
    }

    return mensagemPadrao;
  }
}