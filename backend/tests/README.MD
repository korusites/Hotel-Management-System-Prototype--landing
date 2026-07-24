# 🏨 Sistema de Gerenciamento Hoteleiro (Prototype)

Este repositório contém o código-fonte de um protótipo full-stack desenvolvido para o gerenciamento de hotéis, contemplando microsserviços de backend em Python/FastAPI e uma interface frontend moderna em React/Vite.

---

## 📋 Sumário
1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
3. [Pré-requisitos](#-pré-requisitos)
4. [Configuração do Backend](#-backend-python--fastapi)
5. [Configuração do Frontend](#-frontend-react--vite)
6. [Testes Automatizados (Caixa Branca)](#-testes-automatizados-caixa-branca)
7. [Deploy / Execução Geral](#-execução-geral)

---

## 💡 Sobre o Projeto
O sistema tem como objetivo otimizar as operações cotidianas de um estabelecimento hoteleiro, permitindo o controle de reservas, quartos, serviços, funcionários, além de relatórios e painéis administrativos integrados.

---

## 🛠️ Arquitetura e Tecnologias
O projeto é dividido em camadas distintas:
* **Backend Principal (`/backend`)**: Desenvolvido em **FastAPI (Python)**, utilizando **SQLAlchemy 2.0** (com suporte assíncrono) para comunicação com o banco de dados relacional e **Pydantic v2** para validação de dados e schemas.
* **Microsserviço Financeiro (`/finance-service`)**: Microsserviço auxiliar isolado para processamento financeiro.
* **Frontend (`/src`)**: Desenvolvido em **React**, **TypeScript** e **Vite**, estilizado com componentes modulares e estilização moderna.

---

## ⚙️ Pré-requisitos
Antes de iniciar, certifique-se de ter instalado em sua máquina:
* **Python** (Recomendada a versão **3.12** para evitar incompatibilidades de compilação de pacotes C/Rust no Windows).
* **Node.js** (Versão LTS recomendada) e o gerenciador de pacotes **npm**.
* **Git** para controle de versão.

---

## 🐍 Backend (Python / FastAPI)

### 1. Configuração do Ambiente Virtual
Navegue até a pasta do backend e crie um ambiente isolado:
```bash
cd backend
py -3.12 -m venv venv

Ative o ambiente virtual (no Windows via PowerShell):
.\venv\Scripts\activate

Instalação das Dependências
pip install -r requirements.txt
pip install pytest pytest-mock pytest-asyncio

⚛️ Frontend (React / Vite)
1. Instalação das Dependências
Na raiz do projeto (onde se encontra o arquivo package.json), instale as dependências da interface, incluindo o ambiente de testes (Vitest):
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

🧪 Testes Automatizados (Caixa Branca)
O projeto adota testes de caixa branca para validar a lógica interna, funções de CRUD e o comportamento isolado de componentes e regras de negócio utilizando Mocks.

Executando os Testes do Backend
Com o ambiente virtual do backend ativado e dentro da pasta backend/, execute a suíte de testes do pytest com verbosidade:
python -m pytest tests/ -v

Executando os Testes do Frontend
npx vitest

Subindo o Backend:
Com o ambiente virtual ativado na pasta backend/:
uvicorn app.main:app --reload

Subindo o Frontend:
npm run dev