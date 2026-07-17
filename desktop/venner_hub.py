from __future__ import annotations

import os
import sys
import threading
import tkinter as tk
from tkinter import messagebox, ttk

from venner_desktop.agent_runtime import check_agent_health, fetch_agent_capabilities, try_start_local_agent
from venner_desktop.auth import HubSession, authenticate_hub_session
from venner_desktop.config import AppConfig, get_config_path, load_config, save_config
from venner_desktop.modules import (
    ERP_MODULE,
    ESTOQUE_MODULE,
    MANUTENCAO_MODULE,
    PCP_MODULE,
    PRODUTIVIDADE_MODULE,
    VENDAS_MODULE,
    USUARIOS_MODULE,
    CONFIG_MODULE,
)
from venner_desktop.runtime import (
    check_server_health,
    launch_web_module,
    try_start_local_server,
    wait_for_server,
)
from venner_desktop.updates import UpdateCheckResult, check_for_updates, launch_update_installer, stage_update_package
from venner_desktop.version import get_suite_version


class VennerHubApp:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Venner Hub")
        self.root.geometry("860x900")
        self.root.minsize(820, 820)
        self.root.configure(bg="#0b1320")

        self.config = load_config()
        self.hub_session: HubSession | None = None
        self.pending_update: UpdateCheckResult | None = None

        self.status_var = tk.StringVar(value="Pronto para configurar e autenticar a suíte desktop.")
        self.connection_var = tk.StringVar(value="Servidor ainda não verificado.")
        self.agent_var = tk.StringVar(value="Agent ainda não verificado.")
        self.auth_var = tk.StringVar(value="Nenhuma sessão autenticada no Hub.")
        self.update_var = tk.StringVar(value=self._describe_update())

        self.host_var = tk.StringVar(value=self.config.server_host)
        self.port_var = tk.StringVar(value=str(self.config.server_port))
        self.company_var = tk.StringVar(value=self.config.company_name)
        self.agent_port_var = tk.StringVar(value=str(self.config.agent_port))
        self.label_printer_host_var = tk.StringVar(value=self.config.label_printer_host)
        self.label_printer_port_var = tk.StringVar(value=str(self.config.label_printer_port))
        self.update_source_var = tk.StringVar(value=self.config.update_source)
        self.username_var = tk.StringVar(value=self.config.last_username)
        self.password_var = tk.StringVar(value="")
        self.https_var = tk.BooleanVar(value=self.config.use_https)
        self.auto_agent_var = tk.BooleanVar(value=self.config.auto_start_agent)

        self.login_button: ttk.Button | None = None
        self.logout_button: ttk.Button | None = None

        self._build_ui()

    def _setup_styles(self) -> None:
        style = ttk.Style()
        # Cores extraídas do design de referência
        bg_main = "#0a0e14"      
        bg_card = "#11171f"      
        bg_input = "#161b22"     
        accent_blue = "#2563eb"  
        fg_white = "#ffffff"     
        fg_muted = "#4b5563"     
        fg_teal = "#00d2ff"      
        
        style.theme_use("clam")

        # Configurações Gerais
        style.configure("Venner.TFrame", background=bg_main)
        style.configure("Card.TFrame", background=bg_card, relief="flat")
        style.configure("Status.TFrame", background="#0d151e", borderwidth=1, relief="solid")
        
        # Estilo para os Cards do Dashboard (Sleek List Items)
        style.configure("ModuleCard.TFrame", background="#121922", borderwidth=1, relief="solid")
        
        # Labels
        style.configure(
            "Title.TLabel",
            background=bg_main,
            foreground=fg_white,
            font=("Inter", 22, "bold"),
        )
        style.configure(
            "Subtitle.TLabel",
            background=bg_main,
            foreground="#4b5563",
            font=("Inter", 11),
        )
        style.configure(
            "ModuleTitle.TLabel",
            background="#121922",
            foreground=fg_white,
            font=("Inter", 12, "bold"),
        )
        style.configure(
            "ModuleDesc.TLabel",
            background="#121922",
            foreground="#4b5563",
            font=("Inter", 10),
        )
        style.configure(
            "CardText.TLabel",
            background=bg_main,
            foreground="#4b5563",
            font=("Inter", 9, "bold"),
        )
        style.configure(
            "Session.TLabel",
            background="#0d151e",
            foreground=fg_teal,
            font=("Inter", 10, "bold"),
        )
        style.configure(
            "SessionDetail.TLabel",
            background="#0d151e",
            foreground="#4b5563",
            font=("Inter", 9),
        )

        # Botão Primário (Azul Intenso)
        style.configure(
            "Primary.TButton",
            font=("Inter", 11, "bold"),
            background="#1d4ed8",
            foreground="white",
            borderwidth=0,
            focuscolor="none",
        )
        style.map(
            "Primary.TButton",
            background=[("active", "#2563eb"), ("pressed", "#1e40af")],
            foreground=[("active", "white")],
        )

        # Botão Invisível para Cards (Truque para tornar o frame clicável)
        style.configure(
            "Invisible.TButton",
            background="#121922",
            borderwidth=0,
            highlightthickness=0,
        )

    def _build_ui(self) -> None:
        self._setup_styles()

        container = ttk.Frame(self.root, style="Venner.TFrame", padding=24)
        container.pack(fill="both", expand=True)

        header = ttk.Frame(container, style="Venner.TFrame")
        header.pack(fill="x", pady=(10, 0))
        
        # Brand Header (Logo + Empresa) - Réplica Exata
        brand_container = ttk.Frame(header, style="Venner.TFrame")
        brand_container.pack(anchor="w")
        
        # Desenho do Logo via Canvas para precisão absoluta
        logo_canvas = tk.Canvas(brand_container, width=50, height=50, bg="#0a0e14", highlightthickness=0)
        logo_canvas.pack(side="left", padx=(0, 15))
        
        # Desenha o "V" estilizado branco
        logo_canvas.create_polygon(5, 10, 20, 10, 25, 35, 30, 10, 45, 10, 25, 45, fill="white", smooth=False)
        # Desenha o triângulo azul inferior
        logo_canvas.create_polygon(20, 40, 30, 40, 25, 48, fill="#3da5d9")
            
        brand_text = ttk.Frame(brand_container, style="Venner.TFrame")
        brand_text.pack(side="left")
        ttk.Label(brand_text, text="VENNER", font=("Inter", 18, "bold"), foreground="white", background="#0a0e14").pack(anchor="w")
        ttk.Label(brand_text, text="METALÚRGICA E INJEÇÃO PLÁSTICA", font=("Inter", 8), foreground="#4b5563", background="#0a0e14").pack(anchor="w", pady=(2, 0))

        # Container principal que troca de estado
        self.main_container = ttk.Frame(container, style="Venner.TFrame")
        self.main_container.pack(fill="both", expand=True)

        self.login_frame = ttk.Frame(self.main_container, style="Venner.TFrame")
        self.dashboard_frame = ttk.Frame(self.main_container, style="Venner.TFrame")
        
        self._build_login_screen()
        self._build_dashboard_screen()

        # Inicia no estado correto
        if self.hub_session:
            self._show_dashboard()
        else:
            self._show_login()

        # Rodapé minimalista com design atualizado
        self.footer = ttk.Frame(container, style="Venner.TFrame")
        self.footer.pack(fill="x", side="bottom", pady=(20, 0))
        
        ttk.Label(self.footer, text="Sessão central do Hub", style="Subtitle.TLabel").pack(side="left")
        
        # Botão de engrenagem minimalista
        self.settings_btn = tk.Button(
            self.footer, text="⚙", bg="#0a0e14", fg="#3a4a63", bd=0, 
            command=self._show_config_popup, font=("Inter", 14),
            activebackground="#0a0e14", activeforeground="#ffffff"
        )
        self.settings_btn.pack(side="right", padx=5)

        # Botão Sair (Logout)
        self.logout_hub_btn = tk.Button(
            self.footer, text="SAIR", bg="#0a0e14", fg="#ef4444", bd=0, 
            command=self.logout_hub, font=("Inter", 9, "bold"),
            activebackground="#0a0e14", activeforeground="#ff0000"
        )
        self.logout_hub_btn.pack(side="right", padx=15)

    def _show_login(self) -> None:
        self.dashboard_frame.pack_forget()
        self.login_frame.pack(fill="both", expand=True, pady=40)
        self.root.geometry("450x650")

    def _show_dashboard(self) -> None:
        self.login_frame.pack_forget()
        self._build_dashboard_screen() # Reconstrói os botões com as permissões atuais
        self.dashboard_frame.pack(fill="both", expand=True)
        self.root.geometry("860x720")
        self.auth_var.set(self._describe_session())

    def _build_login_screen(self) -> None:
        parent = self.login_frame
        
        # Títulos alinhados à esquerda conforme screenshot
        header_text = ttk.Frame(parent, style="Venner.TFrame")
        header_text.pack(fill="x", pady=(60, 40)) 
        
        ttk.Label(header_text, text="Venner ERP", style="Title.TLabel").pack(anchor="w")
        ttk.Label(header_text, text="Industrial Intelligence Suite", style="Subtitle.TLabel").pack(anchor="w", pady=(5, 0))

        # Container dos Campos
        fields_container = ttk.Frame(parent, style="Venner.TFrame")
        fields_container.pack(fill="x")

        # Campo Usuário
        ttk.Label(fields_container, text="Usuário", style="CardText.TLabel").pack(anchor="w", pady=(0, 10))
        u_frame = tk.Frame(fields_container, bg="#161b22", padx=15, pady=2)
        u_frame.pack(fill="x", pady=(0, 30))
        tk.Label(u_frame, text="👤", bg="#161b22", fg="#404b5a", font=("Inter", 12)).pack(side="left")
        u_entry = ttk.Entry(u_frame, textvariable=self.username_var)
        u_entry.pack(side="left", fill="x", expand=True)

        # Campo Senha
        ttk.Label(fields_container, text="Senha", style="CardText.TLabel").pack(anchor="w", pady=(0, 10))
        p_frame = tk.Frame(fields_container, bg="#161b22", padx=15, pady=2)
        p_frame.pack(fill="x", pady=(0, 45))
        tk.Label(p_frame, text="🔒", bg="#161b22", fg="#404b5a", font=("Inter", 12)).pack(side="left")
        p_entry = ttk.Entry(p_frame, textvariable=self.password_var, show="*")
        p_entry.pack(side="left", fill="x", expand=True)
        
        # Toggle de visibilidade da senha
        self.pass_visible = False
        def toggle_pass():
            self.pass_visible = not self.pass_visible
            p_entry.config(show="" if self.pass_visible else "*")
            eye_btn.config(text="👁" if not self.pass_visible else "🙈")

        eye_btn = tk.Button(p_frame, text="👁", bg="#161b22", fg="#404b5a", bd=0, 
                           font=("Inter", 12), activebackground="#161b22", command=toggle_pass)
        eye_btn.pack(side="right")
        p_entry.bind("<Return>", lambda _: self.login_hub())

        self.login_button = ttk.Button(parent, text="Entrar no sistema", style="Primary.TButton", command=self.login_hub)
        self.login_button.pack(fill="x", ipady=15, pady=(0, 40))

        # Card de Status de Sessão (Réplica exata)
        self.status_card = tk.Frame(parent, bg="#0d151e", highlightbackground="#1e293b", highlightthickness=1, padx=20, pady=18)
        self.status_card.pack(fill="x")
        
        # Dot verde
        self.status_dot = tk.Label(self.status_card, text="●", bg="#0d151e", fg="#10b981", font=("Inter", 11))
        self.status_dot.place(x=15, y=18)
        
        ttk.Label(self.status_card, text="Sessão ativa", style="Session.TLabel").pack(anchor="w", padx=(25, 0))
        
        self.session_detail = ttk.Label(self.status_card, textvariable=self.auth_var, style="SessionDetail.TLabel")
        self.session_detail.pack(anchor="w", padx=(25, 0), pady=(2, 0))

    def _build_dashboard_screen(self) -> None:
        parent = self.dashboard_frame
        
        # Limpa widgets anteriores
        for widget in parent.winfo_children():
            widget.destroy()
            
        # Lista de Módulos (Estilo List-Card conforme screenshot)
        list_container = ttk.Frame(parent, style="Venner.TFrame")
        list_container.pack(fill="both", expand=True, pady=(20, 0))

        role = self.hub_session.role_name.upper() if self.hub_session else "GUEST"
        user_perm_str = self.hub_session.permissoes if self.hub_session else None
        user_perms = [p.strip().lower() for p in user_perm_str.split(",") if p.strip()] if user_perm_str else []
        
        # Soma as permissões do usuário com as permissões do cargo dele
        # (O backend já envia em 'permissoes' a união ou a Role se o usuário for novo)
        permissions_set = set(user_perms)
        
        # Lista base de módulos com ícones e descrições (Réplica do design)
        # Título, Descrição, Ícone, Cmd, ID
        all_modules = [
            ("ERP Venner (Portal)", "Acesso completo ao sistema integrado", "🏢", self.open_erp, "erp"),
            ("Gestão de estoque", "Produtos, reservas e inventário", "📦", self.open_estoque, "produtos"),
            ("Manutenção industrial", "Máquinas e ordens de serviço", "🔧", self.open_manutencao, "manutencao"),
            ("Relatórios e análise", "Produtividade e indicadores industriais", "📈", self.open_produtividade, "produtividade"),
            ("Operações PCP", "Planejamento e controle de produção", "🏭", self.open_pcp, "pcp"),
            ("Vendas e Comercial", "Pedidos, clientes e comissões", "💼", self.open_vendas, "vendas"),
            ("Usuários e Acessos", "Gestão de perfis e permissões", "👥", self.open_usuarios, "usuarios"),
            ("Ajustes do Sistema", "Configurações globais e etiquetas", "⚙️", self.open_config, "configuracoes"),
        ]

        # Filtra módulos permitidos
        allowed_modules = []
        for title, desc, icon, cmd, module_id in all_modules:
            # ERP é sempre visível se autenticado
            if module_id == "erp":
                allowed_modules.append((title, desc, icon, cmd))
                continue
                
            is_allowed = (
                role == "ADMIN" or 
                module_id in permissions_set or
                "dashboard" in permissions_set # Se tiver dashboard, costuma ter acesso ao hub
            )
            if is_allowed:
                allowed_modules.append((title, desc, icon, cmd))

        for title, desc, icon, cmd in allowed_modules:
            # Container do Card
            card = tk.Frame(list_container, bg="#121922", highlightbackground="#1e293b", highlightthickness=1, cursor="hand2")
            card.pack(fill="x", pady=8)
            
            # Ícone Teal
            tk.Label(card, text=icon, bg="#121922", fg="#00d2ff", font=("Inter", 18)).pack(side="left", padx=20, pady=20)
            
            # Textos
            info_frame = tk.Frame(card, bg="#121922")
            info_frame.pack(side="left", fill="both", expand=True)
            
            tk.Label(info_frame, text=title, bg="#121922", fg="white", font=("Inter", 12, "bold")).pack(anchor="w", pady=(15, 0))
            tk.Label(info_frame, text=desc, bg="#121922", fg="#4b5563", font=("Inter", 10)).pack(anchor="w", pady=(2, 15))

            # Bind de clique no card todo
            for widget in (card, info_frame):
                widget.bind("<Button-1>", lambda e, c=cmd: c())

    def _show_config_popup(self) -> None:
        # Janela de configuração para o suporte/TI
        popup = tk.Toplevel(self.root)
        popup.title("Ajustes de Suporte")
        popup.geometry("500x600")
        popup.configure(bg="#0b1320")
        
        parent = ttk.Frame(popup, style="Card.TFrame", padding=20)
        parent.pack(fill="both", expand=True, padx=10, pady=10)
        
        fields = [
            ("Empresa", self.company_var),
            ("Servidor IP", self.host_var),
            ("Porta ERP", self.port_var),
            ("Porta Agent", self.agent_port_var),
            ("IP Impressora ZPL", self.label_printer_host_var),
            ("Porta ZPL", self.label_printer_port_var),
        ]
        
        for i, (label, var) in enumerate(fields):
            ttk.Label(parent, text=label, style="CardText.TLabel").grid(row=i, column=0, sticky="w", pady=5)
            ttk.Entry(parent, textvariable=var).grid(row=i, column=1, sticky="ew", pady=5, padx=10)
            
        ttk.Button(parent, text="Salvar e Reiniciar", style="Primary.TButton", 
                   command=lambda: [self.save_settings(), popup.destroy()]).grid(row=len(fields), column=0, columnspan=2, pady=20, sticky="ew")
        
        ttk.Button(parent, text="Forçar Início do Servidor", command=self.start_local_server).grid(row=len(fields)+1, column=0, columnspan=2, pady=5, sticky="ew")
        ttk.Button(parent, text="Forçar Início do Agent", command=self.start_local_agent).grid(row=len(fields)+2, column=0, columnspan=2, pady=5, sticky="ew")

    def _describe_session(self) -> str:
        if not self.hub_session:
            return "Nenhuma sessão autenticada no Hub."

        role_suffix = f" · {self.hub_session.role_name}" if self.hub_session.role_name else ""
        return (
            f"Sessão ativa: {self.hub_session.display_name} "
            f"({self.hub_session.username}){role_suffix}"
        )

    def _describe_update(self) -> str:
        current_version = get_suite_version()
        if not self.pending_update:
            return (
                f"Versão atual: {current_version}. "
                "Nenhuma checagem de atualização foi executada."
            )

        manifest = self.pending_update.manifest
        if not manifest:
            return self.pending_update.detail

        note_suffix = f" Notas: {manifest.notes}" if manifest.notes else ""
        if self.pending_update.update_available:
            return (
                f"{manifest.release_name} disponível "
                f"({self.pending_update.current_version} -> {manifest.latest_version})."
                f"{note_suffix}"
            )

        return self.pending_update.detail + note_suffix

    def _read_form_config(self) -> AppConfig:
        port = int(self.port_var.get().strip())
        agent_port = int(self.agent_port_var.get().strip())
        label_printer_port = int(self.label_printer_port_var.get().strip())
        return AppConfig(
            server_host=self.host_var.get().strip() or self.config.server_host,
            server_port=port,
            use_https=self.https_var.get(),
            company_name=self.company_var.get().strip() or "Venner",
            last_username=self.username_var.get().strip(),
            agent_host="127.0.0.1",
            agent_port=agent_port,
            label_printer_host=self.label_printer_host_var.get().strip(),
            label_printer_port=label_printer_port,
            update_source=self.update_source_var.get().strip(),
            update_channel=self.config.update_channel,
            auto_start_agent=self.auto_agent_var.get(),
            last_module=self.config.last_module,
            hub_window=self.config.hub_window,
            vendas_window=self.config.vendas_window,
        )

    def save_settings(self) -> bool:
        try:
            config = self._read_form_config()
        except ValueError:
            messagebox.showerror("Configuração inválida", "As portas devem ser números inteiros.")
            return False

        self.config = config
        save_config(self.config)
        self.status_var.set(f"Configuração salva para {self.config.company_name}.")
        self.connection_var.set(f"Destino atual: {self.config.base_url}")
        printer_target = (
            f" | Zebra/ZPL: {self.config.label_printer_host}:{self.config.label_printer_port}"
            if self.config.has_label_printer
            else ""
        )
        self.agent_var.set(f"Agent configurado em {self.config.agent_url}{printer_target}")
        self.auth_var.set(self._describe_session())
        self.update_var.set(self._describe_update())
        return True

    def _ensure_server_ready(self) -> tuple[bool, str]:
        try_start_local_server(self.config)
        if wait_for_server(self.config, retries=10, interval_seconds=0.5):
            return True, "Servidor pronto para autenticação."

        ok, detail = check_server_health(self.config)
        return ok, detail

    def login_hub(self) -> None:
        if not self.save_settings():
            return

        username = self.username_var.get().strip()
        password = self.password_var.get()
        if not username or not password:
            messagebox.showwarning("Credenciais obrigatórias", "Informe usuário e senha para autenticar o Hub.")
            return

        self.status_var.set("Autenticando sessão central do Hub...")
        self.auth_var.set("Autenticando no servidor...")
        if self.login_button:
            self.login_button.state(["disabled"])

        def worker() -> None:
            try:
                server_ready, detail = self._ensure_server_ready()
                if not server_ready:
                    raise RuntimeError(f"Servidor indisponível: {detail}")

                session = authenticate_hub_session(
                    self.config,
                    username=username,
                    password=password,
                )
            except Exception as exc:
                error_message = str(exc)

                def update_error() -> None:
                    self.hub_session = None
                    self.auth_var.set(f"Falha na autenticação: {error_message}")
                    self.status_var.set("Não foi possível abrir a sessão central do Hub.")
                    if self.login_button:
                        self.login_button.state(["!disabled"])

                self.root.after(0, update_error)
                return

            def update_success() -> None:
                self.hub_session = session
                self.username_var.set(session.username)
                self.password_var.set("")
                self.save_settings()
                self.auth_var.set(self._describe_session())
                self.connection_var.set(f"Online: autenticado em {self.config.base_url}")
                self.status_var.set("Sessão central autenticada. Os próximos módulos já abrirão logados.")
                if self.login_button:
                    self.login_button.state(["!disabled"])
                self._show_dashboard()

            self.root.after(0, update_success)

        threading.Thread(target=worker, daemon=True).start()

    def logout_hub(self) -> None:
        self.hub_session = None
        self.password_var.set("")
        self.auth_var.set("Sessão central removida do Hub.")
        self._show_login()

    def start_local_server(self) -> None:
        if not self.save_settings():
            return

        process = try_start_local_server(self.config)
        if process is None:
            self.status_var.set("Servidor local já estava disponível ou o host configurado é remoto.")
        else:
            self.status_var.set("Servidor local inicializado em segundo plano.")

        self.refresh_connection_status()

    def start_local_agent(self) -> None:
        if not self.save_settings():
            return

        process = try_start_local_agent(self.config)
        if process is None:
            self.status_var.set("Agent já estava disponível ou a configuração atual não usa host local.")
        else:
            self.status_var.set("Venner Agent inicializado em segundo plano.")

        self.refresh_agent_status()

    def refresh_connection_status(self) -> None:
        if not self.save_settings():
            return

        self.connection_var.set("Verificando servidor...")
        self.status_var.set("Executando health check do backend.")

        def worker() -> None:
            ok, detail = check_server_health(self.config)

            def update_ui() -> None:
                if ok:
                    self.connection_var.set(f"Online: {detail}")
                    self.status_var.set(f"Conexão validada em {self.config.base_url}.")
                else:
                    self.connection_var.set(f"Offline: {detail}")
                    self.status_var.set("Servidor não respondeu ao health check.")

            self.root.after(0, update_ui)

        threading.Thread(target=worker, daemon=True).start()

    def refresh_agent_status(self) -> None:
        if not self.save_settings():
            return

        self.agent_var.set("Verificando Venner Agent...")
        self.status_var.set("Executando health check do Agent.")

        def worker() -> None:
            ok, detail = check_agent_health(self.config)
            capabilities_ok, capabilities_payload = fetch_agent_capabilities(self.config)

            def update_ui() -> None:
                if ok:
                    capability_suffix = ""
                    if capabilities_ok and isinstance(capabilities_payload, dict):
                        enabled = [key for key, value in capabilities_payload.items() if value]
                        capability_suffix = (
                            f" Capacidades ativas: {', '.join(enabled)}."
                            if enabled
                            else " Capacidades ainda em modo scaffold."
                        )
                    self.agent_var.set(f"Online: {detail}{capability_suffix}")
                    self.status_var.set(f"Agent validado em {self.config.agent_url}.")
                else:
                    self.agent_var.set(f"Offline: {detail}")
                    self.status_var.set("Venner Agent não respondeu ao health check.")

            self.root.after(0, update_ui)

        threading.Thread(target=worker, daemon=True).start()

    def check_updates(self) -> None:
        if not self.save_settings():
            return

        self.update_var.set("Consultando manifesto de atualização...")
        self.status_var.set("Checando atualização da suíte desktop.")

        def worker() -> None:
            try:
                result = check_for_updates(self.config)
            except Exception as exc:
                error_message = str(exc)

                def update_error() -> None:
                    self.pending_update = None
                    self.update_var.set(f"Falha ao consultar updates: {error_message}")
                    self.status_var.set("A checagem de atualização falhou.")

                self.root.after(0, update_error)
                return

            def update_success() -> None:
                self.pending_update = result
                self.update_var.set(self._describe_update())
                if result.update_available and result.manifest:
                    self.status_var.set(
                        f"Update encontrado: {result.manifest.release_name} ({result.latest_version})."
                    )
                else:
                    self.status_var.set("A estação já está na versão mais recente da suíte.")

            self.root.after(0, update_success)

        threading.Thread(target=worker, daemon=True).start()

    def apply_update(self) -> None:
        if not self.pending_update or not self.pending_update.update_available or not self.pending_update.manifest:
            messagebox.showinfo("Sem update pendente", "Cheque as atualizações antes de tentar aplicar um pacote.")
            return

        if not getattr(sys, "frozen", False):
            messagebox.showinfo(
                "Modo desenvolvimento",
                "O Hub já consegue checar e preparar releases, mas a troca automática de binários foi liberada apenas no executável empacotado.",
            )
            return

        confirmed = messagebox.askyesno(
            "Aplicar atualização",
            (
                f"Aplicar {self.pending_update.manifest.release_name} agora?\n\n"
                "Feche os outros módulos e o Venner Agent antes de continuar. "
                "O Hub será encerrado para concluir a troca dos arquivos."
            ),
        )
        if not confirmed:
            return

        self.status_var.set("Preparando atualização local da suíte...")
        self.update_var.set("Baixando e descompactando o pacote de atualização...")

        def worker() -> None:
            try:
                prepared = stage_update_package(self.pending_update)
                launch_update_installer(prepared, wait_for_pid=os.getpid())
            except Exception as exc:
                error_message = str(exc)

                def update_error() -> None:
                    self.update_var.set(f"Falha ao aplicar o update: {error_message}")
                    self.status_var.set("A atualização não pôde ser preparada.")

                self.root.after(0, update_error)
                return

            def update_success() -> None:
                self.status_var.set(
                    f"Atualização {prepared.version} agendada. O Hub será reiniciado ao final da cópia."
                )
                self.update_var.set(
                    f"Pacote {prepared.release_name} preparado. Encerrando o Hub para liberar os binários."
                )
                self.root.after(900, self.root.destroy)

            self.root.after(0, update_success)

        threading.Thread(target=worker, daemon=True).start()

    def _launch_module(self, module_definition) -> None:
        if not self.save_settings():
            return

        if self.hub_session:
            self.status_var.set(f"Abrindo {module_definition.title} com a sessão central do Hub...")
        else:
            self.status_var.set(f"Abrindo {module_definition.title} pela tela de login...")

        launch_web_module(
            module_definition,
            config=self.config,
            auth_token=self.hub_session.access_token if self.hub_session else None,
            auth_username=self.hub_session.username if self.hub_session else self.username_var.get().strip() or None,
        )

    def open_erp(self) -> None:
        self._launch_module(ERP_MODULE)

    def open_vendas(self) -> None:
        self._launch_module(VENDAS_MODULE)

    def open_estoque(self) -> None:
        self._launch_module(ESTOQUE_MODULE)

    def open_manutencao(self) -> None:
        self._launch_module(MANUTENCAO_MODULE)

    def open_pcp(self) -> None:
        self._launch_module(PCP_MODULE)

    def open_produtividade(self) -> None:
        self._launch_module(PRODUTIVIDADE_MODULE)

    def open_usuarios(self) -> None:
        self._launch_module(USUARIOS_MODULE)

    def open_config(self) -> None:
        self._launch_module(CONFIG_MODULE)

    def run(self) -> int:
        self.refresh_connection_status()
        self.refresh_agent_status()
        self.auth_var.set(self._describe_session())
        self.root.mainloop()
        return 0


def main() -> int:
    return VennerHubApp().run()


if __name__ == "__main__":
    raise SystemExit(main())
