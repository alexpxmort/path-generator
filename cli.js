const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { extractStringImport } = require('./str');

// Função para capitalizar a primeira letra de uma string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const arquivo = 'src/providers/express/routes/index.ts';

const novaRotaImportGenExpress = (nameRoute) => {
  const novoImport = `import ${nameRoute}Router from './${nameRoute}/router';`;
  const novoMiddleware = `router.use('/${nameRoute}', ${nameRoute}Router);`;

  fs.readFile(arquivo, 'utf8', (err, data) => {
    if (err) {
      console.error(`Erro ao ler o arquivo ${arquivo}: ${err}`);
      return;
    }

    // Verifique se o novo import já existe no arquivo
    if (data.includes(novoImport)) {
      console.log('O import já existe no arquivo.');
    } else {
      // Encontre a posição do último import
      const posicaoUltimoImport = data.lastIndexOf('import');

      if (posicaoUltimoImport === -1) {
        console.error(
          'Nenhum import encontrado no arquivo. Verifique o formato do arquivo.'
        );
        return;
      }

      // Encontre a posição do fechamento do último import
      const posicaoFimUltimoImport = data.indexOf(';', posicaoUltimoImport);

      if (posicaoFimUltimoImport === -1) {
        console.error(
          'Formato inválido do último import. Verifique o formato do arquivo.'
        );
        return;
      }

      // Adicione o novo import após o último import
      const importsAtualizados =
        data.slice(0, posicaoFimUltimoImport + 1) +
        '\n' +
        novoImport +
        data.slice(posicaoFimUltimoImport + 1);

      // Encontre a posição do último router.use
      const posicaoUltimoRouterUse = data.lastIndexOf('router.use');

      if (posicaoUltimoRouterUse === -1) {
        console.error(
          'Nenhum router.use encontrado no arquivo. Verifique o formato do arquivo.'
        );

        let arquivoAtualizado = importsAtualizados + novoMiddleware;

        arquivoAtualizado = arquivoAtualizado.replace(
          new RegExp('export { router };', 'g'),
          ''
        );
        arquivoAtualizado += '\nexport { router };';

        // Atualize o arquivo com o novo import e middleware
        fs.writeFile(arquivo, arquivoAtualizado, 'utf8', (err) => {
          if (err) {
            console.error(`Erro ao escrever no arquivo ${arquivo}: ${err}`);
          } else {
            console.log(`Arquivo ${arquivo} atualizado com sucesso.`);
          }
        });

        return;
      }

      // Encontre a posição do fechamento do último router.use
      const posicaoFimUltimoRouterUse = data.indexOf(
        ');',
        posicaoUltimoRouterUse
      );

      if (posicaoFimUltimoRouterUse === -1) {
        console.error(
          'Formato inválido do último router.use. Verifique o formato do arquivo.'
        );
        return;
      }

      // Adicione o novo middleware após o último router.use
      let arquivoAtualizado =
        importsAtualizados +
        data.slice(posicaoFimUltimoRouterUse + 2) +
        '\n' +
        novoMiddleware;

      arquivoAtualizado = arquivoAtualizado.replace(
        new RegExp('export { router };', 'g'),
        ''
      );
      arquivoAtualizado += '\nexport { router };';

      // Atualize o arquivo com o novo import e middleware
      fs.writeFile(arquivo, arquivoAtualizado, 'utf8', (err) => {
        if (err) {
          console.error(`Erro ao escrever no arquivo ${arquivo}: ${err}`);
        } else {
          console.log(`Arquivo ${arquivo} atualizado com sucesso.`);
        }
      });
    }
  });
};

program
  .version('1.0.0')
  .description('CLI para criar estruturas de rotas no Nest.js');

program
  .command('gerar-rota')
  .alias('cr')
  .description('Cria uma estrutura de rota com nome especificado')
  .action(async () => {
    const perguntasSubRota = [
      {
        type: 'confirm',
        name: 'ehSubRota',
        message: 'A rota é uma sub-rota?',
        default: false
      }
    ];

    let rotaPai = null;

    const { ehSubRota } = await inquirer.prompt(perguntasSubRota);

    if (ehSubRota) {
      const perguntasRotaPai = [
        {
          type: 'input',
          name: 'nomeRotaPai',
          message: 'Informe o nome da rota pai:'
        }
      ];

      const { nomeRotaPai } = await inquirer.prompt(perguntasRotaPai);
      rotaPai = nomeRotaPai;

      const perguntaUseCaseName = [
        {
          type: 'input',
          name: 'useCaseName',
          message: 'Informe o nome do use case:'
        }
      ];

      const { useCaseName } = await inquirer.prompt(perguntaUseCaseName);

      const perguntaRotaName = [
        {
          type: 'input',
          name: 'rotaName',
          message: 'Informe o nome da rota:'
        },
        {
          type: 'list',
          name: 'tipo',
          message: 'Selecione o tipo da rota:',
          choices: ['POST', 'GET', 'PUT', 'DELETE']
        },
        {
          type: 'input',
          name: 'parametros',
          message:
            'Informe os parâmetros da rota (se houver, separados por vírgula):'
        },
        {
          type: 'input',
          name: 'body',
          message:
            'Informe o modelo de body da rota (se houver, separados por vírgula):'
        }
      ];

      const { rotaName, tipo, parametros, body } = await inquirer.prompt(
        perguntaRotaName
      );

      let fieldDefinitions = {};

      if (body) {
        fieldDefinitions = `{${body}}`;
      }

      let parameters = parametros ? parametros.split(',') : [];

      let obj = {};

      if (parameters.length > 0) {
        parameters.forEach((param, index) => {
          const [name, type] = param.split(':');

          obj = {
            name,
            type
          };
        });

        parameters = [obj];
      }

      console.log(obj);

      const hasParams = parameters.length > 0;
      const lineParams = hasParams ? `${obj.name}` : '';
      const lineParamsType = hasParams ? `${obj.type}` : '';

      const lineBody = body ? `body` : '';

      const routeFile = path.join(
        __dirname,
        `src/providers/express/routes/${rotaPai}/router.ts`
      );

      fs.readFile(routeFile, 'utf8', (err, data) => {
        const ultimaPosicaoImport = data.lastIndexOf('import');

        const teste =
          data.slice(0, ultimaPosicaoImport) +
          `import { ${extractStringImport(
            data,
            `./${rotaPai}`
          )} ${useCaseName}Controller } from './${rotaPai}';`;

        data =
          teste + '\n' + data.substring(data.lastIndexOf('const'), data.length);

        // Extrair a parte do texto antes do export default
        const textoAntes = data.substring(
          0,
          data.lastIndexOf('export default router;')
        );

        const isSameRoute = rotaName === rotaPai;
        let nameRoute = `/${rotaName}`;

        if (isSameRoute) {
          if (parameters.length > 0) {
            nameRoute = `/:${obj.name}`;
          } else {
            nameRoute = '/';
          }
        }
        const content = `
    router.${tipo.toLowerCase()}('${nameRoute}',${useCaseName}Controller)
  `;
        // Adicionar conteúdo antes do export default
        const novoConteudo = `${textoAntes}${content}\n\n${data.substring(
          data.lastIndexOf('export default router;')
        )}`;

        fs.writeFile(routeFile, novoConteudo, 'utf8', (err) => {
          if (err) {
            console.error(`Erro ao escrever no arquivo ${routeFile}: ${err}`);
          } else {
            console.log(
              `Conteúdo adicionado com sucesso ao arquivo ${routeFile}.`
            );
          }
        });
      });

      const arquivoController = `src/providers/express/routes/${rotaPai}/${rotaPai}.ts`;

      fs.readFile(arquivoController, 'utf8', (err, controllerData) => {
        console.log(controllerData);

        // Encontrar a posição do export default
        const posicaoLastItem = controllerData.indexOf('};');

        if (posicaoLastItem === -1) {
          console.error('Declaração "last item" não encontrada no arquivo.');
          return;
        }

        const contentController = `
      export const ${useCaseName}Controller = async (req: Request, res: Response) => {
        ${hasParams ? `const {${obj.name}} = req.params` : ''}

        ${body ? `const {body} = req` : ''}
        return res.json(await ${useCaseName}Port(${lineParams}${lineBody}));
      };

      `;

        const ultimaPosicaoImportController =
          controllerData.lastIndexOf('import');

        const testeController =
          controllerData.slice(0, ultimaPosicaoImportController) +
          `import { ${extractStringImport(
            controllerData,
            `@ports/usecases/${rotaPai}`
          )} ${useCaseName}Port } from '@ports/usecases/${rotaPai}';`;

        controllerData =
          testeController +
          '\n' +
          controllerData.substring(
            controllerData.indexOf('export'),
            controllerData.length
          );
        const novoConteudoController = `${controllerData.substring(
          0,
          controllerData.lastIndexOf('};')
        )}};${contentController}`;

        fs.writeFile(
          arquivoController,
          novoConteudoController,
          'utf8',
          (err) => {
            if (err) {
              console.error(
                `Erro ao escrever no arquivo ${arquivoController}: ${err}`
              );
            } else {
              console.log(
                `Conteúdo adicionado com sucesso ao arquivo ${arquivoController}.`
              );
            }
          }
        );
      });

      const arquivoPort = `src/ports/usecases/${rotaPai}/index.ts`;

      fs.readFile(arquivoPort, 'utf8', (err, portData) => {
        console.log(portData);

        // Encontrar a posição do export default
        const posicaoLastItemPort = portData.indexOf('};');

        if (posicaoLastItemPort === -1) {
          console.error(
            'Declaração "last item port" não encontrada no arquivo.'
          );
          return;
        }

        const ultimaPosicaoImportPort = portData.lastIndexOf('import');

        const contentPort = `
        ${body ? `interface ${useCaseName}Type${fieldDefinitions}` : ''}
        export const ${useCaseName}Port = async ( ${
          parameters.length > 0 ? `${lineParams}:${lineParamsType}` : ''
        }  
        ${body ? `data:${useCaseName}Type` : ''} 
        
        ) => {
  
            return await  ${useCaseName}UseCase( ${lineParams}${
          body ? 'data' : ''
        });
        };
  
        `;

        const testePort =
          portData.slice(0, ultimaPosicaoImportPort) +
          `import { ${extractStringImport(
            portData,
            `@usecases/${rotaPai}`
          )} ${useCaseName}UseCase } from '@usecases/${rotaPai}';`;

        portData =
          testePort +
          '\n' +
          portData.substring(portData.indexOf('export'), portData.length);
        const novoConteudoPort = `${portData.substring(
          0,
          portData.lastIndexOf('};')
        )}};${contentPort}`;

        fs.writeFile(arquivoPort, novoConteudoPort, 'utf8', (err) => {
          if (err) {
            console.error(`Erro ao escrever no arquivo ${arquivoPort}: ${err}`);
          } else {
            console.log(
              `Conteúdo adicionado com sucesso ao arquivo ${arquivoPort}.`
            );
          }
        });
      });

      const arquivoUseCase = `src/usecases/${rotaPai}/index.ts`;

      fs.readFile(arquivoUseCase, 'utf8', (err, useCaseData) => {
        console.log(useCaseData);

        // Encontrar a posição do export default
        const posicaoLastItemUseCase = useCaseData.indexOf('};');

        if (posicaoLastItemUseCase === -1) {
          console.error(
            'Declaração "last item use case" não encontrada no arquivo.'
          );
          return;
        }

        const contentUseCase = `
        ${body ? `interface ${useCaseName}Type${fieldDefinitions}` : ''}
        export const ${useCaseName}UseCase = async (${
          parameters.length > 0 ? `${lineParams}:${lineParamsType}` : ''
        }
        ${body ? `data:${useCaseName}Type` : ''} 

         ) => {
  
          return await Promise.resolve("OLA NOVA ROTA ${rotaName}");
        };
  
        `;

        useCaseData = useCaseData.substring(
          useCaseData.indexOf('export'),
          useCaseData.length
        );
        const novoConteudoUseCase = `${useCaseData.substring(
          0,
          useCaseData.lastIndexOf('};')
        )}};${contentUseCase}`;

        fs.writeFile(arquivoUseCase, novoConteudoUseCase, 'utf8', (err) => {
          if (err) {
            console.error(
              `Erro ao escrever no arquivo ${arquivoUseCase}: ${err}`
            );
          } else {
            console.log(
              `Conteúdo adicionado com sucesso ao arquivo ${arquivoUseCase}.`
            );
          }
        });
      });
      return false;
    }

    const perguntas = [
      {
        type: 'input',
        name: 'nome',
        message: 'Informe o nome da rota:'
      },
      {
        type: 'list',
        name: 'tipo',
        message: 'Selecione o tipo da rota:',
        choices: ['POST', 'GET', 'PUT', 'DELETE']
      },
      {
        type: 'input',
        name: 'parametros',
        message:
          'Informe os parâmetros da rota (se houver, separados por vírgula):'
      }
    ];
    let obj = {};
    const respostas = await inquirer.prompt(perguntas);
    const { nome, tipo, parametros } = respostas;

    let parameters = parametros ? parametros.split(',') : [];

    if (parameters.length > 0) {
      parameters.forEach((param, index) => {
        const [name, type] = param.split(':');

        obj = {
          name,
          type
        };
      });

      parameters = [obj];
    }

    const baseDir = path.join(__dirname, 'src/providers/express/routes');
    const rotaDir = path.join(baseDir, nome);
    const portsDir = path.join(__dirname, 'src/ports/usecases');
    const portsDirNew = path.join(portsDir, nome);
    const usecaseDir = path.join(__dirname, 'src/usecases');
    const usecaseDirNew = path.join(usecaseDir, nome);

    const repoDir = path.join(__dirname, 'src/providers/db/repositories');
    const repoDirNew = path.join(repoDir, nome);

    if (!fs.existsSync(rotaDir)) {
      fs.mkdirSync(rotaDir);
      fs.mkdirSync(portsDirNew);
      fs.mkdirSync(usecaseDirNew);
      fs.mkdirSync(repoDirNew);

      const hasParams = parameters.length > 0;
      const lineRouter = hasParams
        ? `const {${parameters[0].name}} = req.params`
        : '';
      const lineParams = hasParams ? `${parameters[0].name}` : '';
      const lineParamsType = hasParams ? `${parameters[0].type}` : '';

      const portsContent = `
      import { ${nome}UseCase } from '@usecases/${nome}';

      export const ${nome}Port = async (
        ${
          ['POST', 'PUT'].includes(tipo.toUpperCase())
            ? 'data'
            : `${
                parameters.length > 0 ? `${lineParams}:${lineParamsType}` : ''
              }   `
        }
      ) => {
        return await ${nome}UseCase(${
        ['POST', 'PUT'].includes(tipo.toUpperCase()) ? 'data' : `${lineParams}`
      });
      };

      `;

      fs.writeFileSync(path.join(portsDirNew, `index.ts`), portsContent);

      const usecaseContent = `
      export const ${nome}UseCase = async (${
        ['POST', 'PUT'].includes(tipo.toUpperCase())
          ? 'data'
          : `${
              parameters.length > 0 ? `${lineParams}:${lineParamsType}` : ''
            }   `
      }) => {
        return await Promise.resolve(${
          ['POST', 'PUT'].includes(tipo.toUpperCase())
            ? 'data'
            : `'OLA NOVA ROTA ${nome}'`
        });
      };

      `;

      fs.writeFileSync(path.join(usecaseDirNew, `index.ts`), usecaseContent);

      const repoContent = `
      import { BaseRepo } from '@providers/db';

      class ${nome}Repository implements BaseRepo {
        async findAll(): Promise<any> {
          return true;
        }
      
        async findById(id: string | number): Promise<any> {
          return true;
        }
      
        async create(data: any): Promise<any> {
          return data;
        }
      
        async update(data: any, id: string | number): Promise<any> {
          return data;
        }
      
        async delete(id: string | number): Promise<any> {
          return true;
        }
      }
      
      export default new ${nome}Repository();
      
      `;

      fs.writeFileSync(path.join(repoDirNew, `index.ts`), repoContent);

      const parametrosRota =
        parameters.length > 0
          ? `/:${parameters.map((parameter) => parameter.name).join('/:')}`
          : '/';

      const routerContent = `
      import { Router } from 'express';
      import { ${nome} } from './${nome}';

      const router = Router();


      router.${tipo.toLowerCase()}('${parametrosRota}',  ${nome});

      export default router;

`;
      fs.writeFileSync(path.join(rotaDir, `router.ts`), routerContent);

      const controllerContent = `
      import { Request, Response } from 'express';
      import {
        ${nome}Port
      } from '@ports/usecases/${nome}';

      export const ${nome} = async (req: Request, res: Response) => {
        ${
          ['POST', 'PUT'].includes(tipo.toUpperCase())
            ? 'const { body } = req;'
            : lineRouter
        }
        return res.json(await ${nome}Port(${
        ['POST', 'PUT'].includes(tipo.toUpperCase()) ? 'body' : `${lineParams}`
      }));
      };
`;
      fs.writeFileSync(path.join(rotaDir, `${nome}.ts`), controllerContent);

      novaRotaImportGenExpress(nome);
      console.log(
        `Estrutura de rota "${nome}" criada com sucesso em src/providers/express/routes.`
      );
    } else {
      console.log(
        `A estrutura de rota "${nome}" já existe em src/providers/express/routes.`
      );
    }
  });

program.parse(process.argv);
