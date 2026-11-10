document.addEventListener("DOMContentLoaded", () => {
  // Verificar la conexión con Supabase
  const supabaseClient = window.supabaseClient;

  if (!supabaseClient) {
    console.error(
      "Supabase no está conectado. Revisa js/supabase-config.js"
    );
    return;
  }

  // Elementos del HTML
  const guest = document.getElementById("guest");
  const userPanel = document.getElementById("user");
  const form = document.getElementById("auth-form");
  const nameField = document.getElementById("name-field");
  const nameInput = document.getElementById("a-name");
  const emailInput = document.getElementById("a-email");
  const passwordInput = document.getElementById("a-pass");
  const submitButton = document.getElementById("a-submit");
  const message = document.getElementById("a-msg");
  const logoutButton = document.getElementById("logout");
  const forgotLink = document.getElementById("forgot-link");
  const forgotButton = document.getElementById("forgot-password");
  const eyeButton = document.getElementById("a-eye");
  const googleButton = document.getElementById("google");
  const tabs = document.querySelectorAll("[data-m]");
  const recovery = document.getElementById("recovery");
  const recoveryForm = document.getElementById("recovery-form");
  const recoveryMsg = document.getElementById("r-msg");

  let mode = "login";

  // Mostrar mensajes
  function showMessage(text, error = false) {
    if (!message) return;

    message.textContent = text;
    message.style.color = error ? "#dc2626" : "#15803d";
    message.hidden = false;
  }

  // Cambiar entre inicio de sesión y registro
  function clearForm() {
    if (form) form.reset();
    if (passwordInput) passwordInput.type = "password";
    if (eyeButton) eyeButton.setAttribute("aria-label", "Mostrar contraseña");
    ["req-length", "req-upper", "req-lower", "req-number"].forEach((id) => {
      document.getElementById(id)?.classList.remove("valid");
    });
    const fill = document.getElementById("strength-fill");
    if (fill) fill.style.width = "0";
    const text = document.getElementById("strength-text");
    if (text) text.textContent = "Contraseña débil";
  }

  function setMode(newMode) {
    if (newMode !== mode) clearForm();
    mode = newMode;

    if (nameField) {
      nameField.hidden = mode !== "register";
    }

    if (submitButton) {
      submitButton.textContent =
        mode === "login" ? "Iniciar sesión" : "Crear cuenta";
    }

    tabs.forEach((tab) => {
      const active = tab.dataset.m === mode;

      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    if (forgotLink) {
      forgotLink.hidden = mode !== "login";
    }

    const box = document.getElementById("strength-box");
    if (box) box.hidden = mode !== "register" || !passwordInput?.value;

    if (passwordInput) {
      passwordInput.autocomplete =
        mode === "login" ? "current-password" : "new-password";
    }

    if (message) {
      message.textContent = "";
      message.hidden = true;
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setMode(tab.dataset.m);
    });
  });

  // Mostrar u ocultar contraseña
  if (eyeButton && passwordInput) {
    eyeButton.addEventListener("click", () => {
      const showing = passwordInput.type === "text";

      passwordInput.type = showing ? "password" : "text";
      eyeButton.setAttribute(
        "aria-label",
        showing ? "Mostrar contraseña" : "Ocultar contraseña"
      );
    });
  }

  // Validar contraseña durante el registro
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      const password = passwordInput.value;

      const checks = [
        ["req-length", password.length >= 8],
        ["req-upper", /[A-Z]/.test(password)],
        ["req-lower", /[a-z]/.test(password)],
        ["req-number", /[0-9]/.test(password)]
      ];

      checks.forEach(([id, valid]) => {
        const element = document.getElementById(id);

        if (element) {
          element.classList.toggle("valid", valid);
        }
      });

      const strengthFill = document.getElementById("strength-fill");
      const strengthText = document.getElementById("strength-text");
      const strengthBox = document.getElementById("strength-box");

      const score = checks.filter(([, valid]) => valid).length;

      if (strengthFill) {
        strengthFill.style.width = `${score * 25}%`;
        strengthFill.style.background =
          score <= 1 ? "#dc2626" : score === 2 ? "#f59e0b" : score === 3 ? "#2563eb" : "#16a34a";
      }

      if (strengthText) {
        strengthText.textContent =
          score <= 1 ? "Contraseña débil" :
          score === 2 ? "Contraseña regular" :
          score === 3 ? "Contraseña buena" :
          "Contraseña segura";
      }

      if (strengthBox) {
        strengthBox.hidden = mode !== "register" || !password;
      }
    });
  }

  // Registrar o iniciar sesión
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const name = nameInput ? nameInput.value.trim() : "";

      if (!email || !password) {
        showMessage("Ingresa tu correo y contraseña.", true);
        return;
      }

      if (mode === "register" && !name) {
        showMessage("Ingresa tu nombre completo.", true);
        return;
      }

      if (mode === "register" && password.length < 8) {
        showMessage("La contraseña debe tener al menos 8 caracteres.", true);
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Procesando...";

      try {
        if (mode === "register") {
          const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name
              }
            }
          });

          if (error) throw error;

          if (data.session) {
            showMessage("¡Cuenta creada correctamente!");
            clearForm();
            await updateInterface(data.session.user);
          } else {
            clearForm();
            showMessage(
              "Registro enviado. Revisa tu correo para confirmar la cuenta."
            );
          }
        } else {
          const { data, error } =
            await supabaseClient.auth.signInWithPassword({
              email,
              password
            });

          if (error) throw error;

          showMessage("¡Inicio de sesión correcto!");
          clearForm();
          await updateInterface(data.user);
        }
      } catch (error) {
        console.error("Error de autenticación:", error);
        showMessage(error.message || "No se pudo completar la operación.", true);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent =
          mode === "login" ? "Iniciar sesión" : "Crear cuenta";
      }
    });
  }

  // Actualizar la interfaz según el usuario
  async function updateInterface(user) {
    if (!user) return;

    if (guest) guest.hidden = true;
    if (recovery) recovery.hidden = true;
    if (userPanel) userPanel.hidden = false;

    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Usuario";

    const nameElement = document.getElementById("u-name");
    const emailElement = document.getElementById("u-mail");
    const roleElement = document.getElementById("u-rol");
    const avatar = document.getElementById("u-avatar");

    if (nameElement) nameElement.textContent = name;
    if (emailElement) emailElement.textContent = user.email || "";
    if (roleElement) roleElement.textContent = "Cliente";
    if (avatar) {
      avatar.textContent = name
        .split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "EM";
    }

    // El enlace al panel solo se muestra si el perfil tiene rol admin.
    // La seguridad real la imponen las políticas RLS de Supabase, no este botón.
    const adminLink = document.getElementById("u-admin");
    if (adminLink) adminLink.hidden = true;

    try {
      const { data: perfil } = await supabaseClient
        .from("perfiles").select("rol").eq("id", user.id).maybeSingle();

      if (perfil?.rol === "admin") {
        if (roleElement) roleElement.textContent = "Administrador";
        if (adminLink) adminLink.hidden = false;
      }
    } catch (error) {
      console.warn("No se pudo leer el perfil:", error);
    }

    loadOrders(user);
  }

  // Mis pedidos (tabla pedidos, filtrada por RLS al usuario actual)
  const ESTADOS = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    enviado: "Enviado",
    entregado: "Entregado",
    cancelado: "Cancelado"
  };

  const esc = (t) =>
    String(t ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  async function loadOrders(user) {
    const box = document.getElementById("u-orders");
    if (!box) return;

    const { data, error } = await supabaseClient
      .from("pedidos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("No se pudieron cargar los pedidos:", error.message);
      return;
    }
    if (!data?.length) return; // se queda el estado vacío del HTML

    box.className = "orders-list";
    box.innerHTML = data.map((o) => {
      const fecha = new Date(o.created_at).toLocaleDateString("es-PE", {
        day: "2-digit", month: "short", year: "numeric"
      });
      const items = (o.items || [])
        .map((i) => `<li>${esc(i.name)} × ${esc(i.qty)}</li>`).join("");
      return `
        <article class="order">
          <div class="order-top">
            <div><strong>Pedido #${esc(o.id)}</strong> <span class="order-date">· ${fecha}</span></div>
            <span class="pill st-${esc(o.estado)}">${ESTADOS[o.estado] || esc(o.estado)}</span>
          </div>
          <ul>${items}</ul>
          <div class="order-total"><span>Total</span><span>S/ ${Number(o.total).toFixed(2)}</span></div>
        </article>`;
    }).join("");
  }

  // Cerrar sesión
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;

      try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) throw error;

        if (userPanel) userPanel.hidden = true;
        if (guest) guest.hidden = false;

        if (form) form.reset();

        setMode("login");
        showMessage("Has cerrado sesión correctamente.");
      } catch (error) {
        showMessage(error.message || "No se pudo cerrar la sesión.", true);
      } finally {
        logoutButton.disabled = false;
      }
    });
  }

  // Recuperar contraseña
  async function recoverPassword() {
    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
      showMessage("Escribe tu correo para recuperar la contraseña.", true);
      if (emailInput) emailInput.focus();
      return;
    }

    try {
      const { error } =
        await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/cuenta.html"
        });

      if (error) throw error;

      showMessage("Si el correo está registrado, recibirás instrucciones para recuperarlo.");
    } catch (error) {
      showMessage(error.message || "No se pudo enviar el correo.", true);
    }
  }

  if (forgotLink) {
    forgotLink.addEventListener("click", (event) => {
      event.preventDefault();
      recoverPassword();
    });
  }

  if (forgotButton) {
    forgotButton.addEventListener("click", recoverPassword);
  }

  // Inicio de sesión con Google
  if (googleButton) {
    googleButton.addEventListener("click", async () => {
      try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/cuenta.html"
          }
        });

        if (error) throw error;
      } catch (error) {
        showMessage(
          error.message ||
          "No se pudo iniciar sesión con Google. Revisa su configuración en Supabase.",
          true
        );
      }
    });
  }

  // Mantener la interfaz sincronizada con la sesión
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      // El usuario llegó desde el correo de recuperación: pedir nueva contraseña
      if (guest) guest.hidden = true;
      if (userPanel) userPanel.hidden = true;
      if (recovery) recovery.hidden = false;
      return;
    }
    if (recovery && !recovery.hidden) return;

    if (session?.user) {
      updateInterface(session.user);
    } else {
      if (userPanel) userPanel.hidden = true;
      if (guest) guest.hidden = false;
    }
  });

  // Recuperar la sesión al abrir la página
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("No se pudo recuperar la sesión:", error.message);
      return;
    }

    // Si estamos en el flujo de recuperación, no sobrescribir esa pantalla
    if (recovery && !recovery.hidden) return;

    if (data.session?.user) {
      updateInterface(data.session.user);
    } else {
      if (userPanel) userPanel.hidden = true;
      if (guest) guest.hidden = false;
    }
  });

  // Establecer nueva contraseña (flujo de recuperación)
  if (recoveryForm) {
    recoveryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const pass = document.getElementById("r-pass").value;
      const pass2 = document.getElementById("r-pass2").value;
      const say = (text, bad) => {
        recoveryMsg.textContent = text;
        recoveryMsg.style.color = bad ? "#dc2626" : "#15803d";
        recoveryMsg.hidden = false;
      };

      if (pass.length < 8) return say("La contraseña debe tener al menos 8 caracteres.", true);
      if (pass !== pass2) return say("Las contraseñas no coinciden.", true);

      const { data, error } = await supabaseClient.auth.updateUser({ password: pass });
      if (error) return say(error.message || "No se pudo actualizar la contraseña.", true);

      say("¡Contraseña actualizada!");
      setTimeout(() => {
        if (recovery) recovery.hidden = true;
        updateInterface(data.user);
      }, 900);
    });
  }

  // Estado inicial
  setMode("login");
});