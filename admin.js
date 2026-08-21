(function () {
  "use strict";

  var sb = window.sbClient;
  if (!sb) {
    document.getElementById("loginError").textContent = "Could not reach Supabase. Check your connection and reload.";
    return;
  }

  var loginView = document.getElementById("loginView");
  var dashboardView = document.getElementById("dashboardView");
  var loginForm = document.getElementById("loginForm");
  var loginError = document.getElementById("loginError");
  var logoutBtn = document.getElementById("logoutBtn");

  // =====================================================================
  // AUTH
  // =====================================================================
  function showDashboard() {
    loginView.hidden = true;
    dashboardView.hidden = false;
    loadLeads();
    loadGallery();
  }
  function showLogin() {
    loginView.hidden = false;
    dashboardView.hidden = true;
  }

  sb.auth.getSession().then(function (res) {
    if (res.data && res.data.session) showDashboard(); else showLogin();
  });

  sb.auth.onAuthStateChange(function (event, session) {
    if (session) showDashboard(); else showLogin();
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginError.textContent = "";
    var email = document.getElementById("loginEmail").value.trim();
    var password = document.getElementById("loginPassword").value;
    var submitBtn = loginForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    sb.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
      submitBtn.disabled = false;
      if (res.error) {
        loginError.textContent = "Sign-in failed: " + res.error.message;
      } else {
        loginForm.reset();
      }
    }).catch(function (err) {
      submitBtn.disabled = false;
      loginError.textContent = "Sign-in failed. Please try again.";
      console.error(err);
    });
  });

  logoutBtn.addEventListener("click", function () {
    sb.auth.signOut();
  });

  // =====================================================================
  // TABS
  // =====================================================================
  document.querySelectorAll(".admin-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".admin-tab").forEach(function (t) { t.classList.remove("is-active"); });
      document.querySelectorAll(".admin-panel").forEach(function (p) { p.classList.remove("is-active"); });
      tab.classList.add("is-active");
      document.getElementById("panel-" + tab.getAttribute("data-tab")).classList.add("is-active");
    });
  });

  // =====================================================================
  // LEADS
  // =====================================================================
  var leadsBody = document.getElementById("leadsBody");
  var leadsTable = document.getElementById("leadsTable");
  var leadsEmpty = document.getElementById("leadsEmpty");
  document.getElementById("refreshLeadsBtn").addEventListener("click", loadLeads);

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  function loadLeads() {
    sb.from("leads").select("*").order("created_at", { ascending: false }).then(function (res) {
      if (res.error) { console.error(res.error); return; }
      var rows = res.data || [];
      if (!rows.length) {
        leadsTable.hidden = true;
        leadsEmpty.hidden = false;
        return;
      }
      leadsEmpty.hidden = true;
      leadsTable.hidden = false;
      leadsBody.innerHTML = "";
      rows.forEach(function (lead) {
        var tr = document.createElement("tr");
        var when = new Date(lead.created_at).toLocaleString();
        tr.innerHTML =
          "<td>" + escapeHtml(when) + "</td>" +
          "<td><span class=\"admin-source\">" + escapeHtml(lead.source) + "</span></td>" +
          "<td>" + escapeHtml(lead.name) + "</td>" +
          "<td>" + escapeHtml(lead.phone) + "</td>" +
          "<td>" + escapeHtml(lead.event_date) + "</td>" +
          "<td class=\"wrap-cell\">" + escapeHtml(lead.message) + "</td>" +
          "<td></td><td></td>";

        var contactedTd = tr.children[6];
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!lead.contacted;
        checkbox.addEventListener("change", function () {
          sb.from("leads").update({ contacted: checkbox.checked }).eq("id", lead.id).then(function (res) {
            if (res.error) console.error(res.error);
          });
        });
        contactedTd.appendChild(checkbox);

        var actionsTd = tr.children[7];
        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "admin-delete-btn";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", function () {
          if (!confirm("Delete this lead?")) return;
          sb.from("leads").delete().eq("id", lead.id).then(function (res) {
            if (res.error) { console.error(res.error); return; }
            tr.remove();
          });
        });
        actionsTd.appendChild(delBtn);

        leadsBody.appendChild(tr);
      });
    }).catch(function (err) { console.error(err); });
  }

  // =====================================================================
  // GALLERY
  // =====================================================================
  var galleryAdminGrid = document.getElementById("galleryAdminGrid");
  var galleryEmpty = document.getElementById("galleryEmpty");

  function loadGallery() {
    sb.from("gallery").select("*").order("sort_order", { ascending: true }).then(function (res) {
      if (res.error) { console.error(res.error); return; }
      var rows = res.data || [];
      galleryAdminGrid.innerHTML = "";
      galleryEmpty.hidden = !!rows.length;
      rows.forEach(function (row) {
        var card = document.createElement("div");
        card.className = "admin-gallery-item";

        var img = document.createElement("img");
        img.src = row.image_path;
        img.alt = row.caption || "";
        card.appendChild(img);

        var body = document.createElement("div");
        body.className = "admin-gallery-item-body";
        var cat = document.createElement("div");
        cat.className = "admin-gallery-item-cat";
        cat.textContent = row.category || "";
        var cap = document.createElement("div");
        cap.className = "admin-gallery-item-caption";
        cap.textContent = row.caption || "";
        var meta = document.createElement("div");
        meta.className = "admin-gallery-item-meta";
        meta.textContent = row.span_two ? "Wide card" : "Standard";
        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "admin-delete-btn";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", function () {
          if (!confirm("Remove this photo from the gallery?")) return;
          sb.from("gallery").delete().eq("id", row.id).then(function (res) {
            if (res.error) { console.error(res.error); return; }
            card.remove();
          });
        });

        body.appendChild(cat);
        body.appendChild(cap);
        body.appendChild(meta);
        body.appendChild(delBtn);
        card.appendChild(body);
        galleryAdminGrid.appendChild(card);
      });
    }).catch(function (err) { console.error(err); });
  }

  // =====================================================================
  // UPLOAD
  // =====================================================================
  var uploadForm = document.getElementById("uploadForm");
  var uploadError = document.getElementById("uploadError");
  var uploadNote = document.getElementById("uploadNote");
  var uploadSubmit = document.getElementById("uploadSubmit");
  var MAX_BYTES = 8 * 1024 * 1024;

  uploadForm.addEventListener("submit", function (e) {
    e.preventDefault();
    uploadError.textContent = "";
    uploadNote.textContent = "";

    var fileInput = document.getElementById("uploadFile");
    var file = fileInput.files[0];
    var category = document.getElementById("uploadCategory").value.trim();
    var caption = document.getElementById("uploadCaption").value.trim();
    var spanTwo = document.getElementById("uploadSpan").checked;

    if (!file) { uploadError.textContent = "Choose a photo first."; return; }
    if (file.size > MAX_BYTES) { uploadError.textContent = "Photo is too large (max 8MB)."; return; }
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { uploadError.textContent = "Only PNG, JPEG or WEBP images are allowed."; return; }

    uploadSubmit.disabled = true;
    uploadNote.textContent = "Uploading…";

    var safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
    var path = Date.now() + "-" + safeName;

    sb.storage.from("gallery").upload(path, file, { cacheControl: "3600", upsert: false })
      .then(function (uploadRes) {
        if (uploadRes.error) throw uploadRes.error;
        var publicUrl = sb.storage.from("gallery").getPublicUrl(path).data.publicUrl;
        return sb.from("gallery").select("sort_order").order("sort_order", { ascending: false }).limit(1)
          .then(function (maxRes) {
            var nextOrder = (maxRes.data && maxRes.data.length) ? maxRes.data[0].sort_order + 1 : 0;
            return sb.from("gallery").insert({
              image_path: publicUrl, caption: caption || null, category: category || null,
              span_two: spanTwo, sort_order: nextOrder
            });
          });
      })
      .then(function (insertRes) {
        uploadSubmit.disabled = false;
        if (insertRes.error) throw insertRes.error;
        uploadNote.textContent = "Photo added.";
        uploadForm.reset();
        loadGallery();
      })
      .catch(function (err) {
        uploadSubmit.disabled = false;
        uploadNote.textContent = "";
        uploadError.textContent = "Upload failed: " + (err && err.message ? err.message : "please try again.");
        console.error(err);
      });
  });
})();
