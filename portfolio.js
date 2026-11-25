(() => {
 document.querySelector('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('charious.mclaurin@gmail.com');document.querySelector('#contact-status').textContent='Email address copied.';}catch{document.querySelector('#contact-status').textContent='Email me at charious.mclaurin@gmail.com.';}});
 document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{document.documentElement.dataset.themePreference=button.dataset.theme;document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));window.dispatchEvent(new Event('portfolio-theme-change'));}));
})();
