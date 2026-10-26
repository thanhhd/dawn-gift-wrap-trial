if (!customElements.get('gift-wrap')) {
  /**
   * Opens the gift-wrap fields when the checkbox is ticked.
   * The fields are disabled while closed, so text typed before unticking is never added to the cart.
   */
  class GiftWrap extends HTMLElement {
    connectedCallback() {
      this.toggleEl = this.querySelector('[data-gift-wrap-toggle]');
      this.fieldsEl = this.querySelector('[data-gift-wrap-fields]');
      if (!this.toggleEl || !this.fieldsEl) return;

      this.toggleEl.addEventListener('change', this.handleToggle);
      this.handleToggle();
    }

    disconnectedCallback() {
      this.toggleEl?.removeEventListener('change', this.handleToggle);
    }

    handleToggle = () => {
      const isOpen = this.toggleEl.checked;
      this.fieldsEl.hidden = !isOpen;
      this.fieldsEl.disabled = !isOpen;
    };
  }

  customElements.define('gift-wrap', GiftWrap);
}
