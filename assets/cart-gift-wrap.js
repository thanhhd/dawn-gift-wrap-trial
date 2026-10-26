if (!customElements.get('cart-gift-wrap')) {
  /**
   * Edits the gift-wrap details of a cart line in place.
   * The update goes through Dawn's cart items element, so the cart re-renders as it does for a quantity change.
   */
  class CartGiftWrap extends HTMLElement {
    connectedCallback() {
      this.summaryEl = this.querySelector('[data-gift-wrap-summary]');
      this.formEl = this.querySelector('[data-gift-wrap-form]');
      this.addEventListener('click', this.handleClick);
      this.addEventListener('keydown', this.handleKeydown);
      this.addEventListener('change', this.handleChange);
    }

    disconnectedCallback() {
      this.removeEventListener('click', this.handleClick);
      this.removeEventListener('keydown', this.handleKeydown);
      this.removeEventListener('change', this.handleChange);
    }

    // Dawn's cart items treat every change event inside them as a quantity edit
    handleChange = (event) => event.stopPropagation();

    handleClick = (event) => {
      const actionEl = event.target.closest('[data-gift-wrap-action]');
      if (!actionEl) return;

      const { giftWrapAction } = actionEl.dataset;
      if (giftWrapAction === 'edit') return this.setEditing(true);
      if (giftWrapAction === 'cancel') return this.setEditing(false);
      this.update(event);
    };

    handleKeydown = (event) => {
      // Enter in a field would otherwise submit the surrounding cart form and go to checkout
      if (event.key !== 'Enter' || !event.target.matches('input[type="text"]')) return;
      event.preventDefault();
      this.update(event);
    };

    /** @param {boolean} isEditing Show the edit form instead of the summary */
    setEditing(isEditing) {
      this.summaryEl.hidden = isEditing;
      this.formEl.hidden = !isEditing;
      if (!isEditing) this.resetFields();

      const focusEl = isEditing
        ? this.formEl.querySelector('input[type="text"]')
        : this.summaryEl.querySelector('[data-gift-wrap-action="edit"]');
      focusEl.focus();
    }

    resetFields() {
      for (const fieldEl of this.formEl.querySelectorAll('input, textarea')) {
        fieldEl.checked = fieldEl.defaultChecked;
        fieldEl.value = fieldEl.defaultValue;
      }
    }

    /**
     * Cart change replaces all of a line's properties, so every other property is sent back with the gift ones.
     * @returns {Object<string, string>}
     */
    getProperties() {
      // Liquid's json filter turns the properties hash into [name, value] pairs
      const properties = Object.fromEntries(JSON.parse(this.dataset.properties));
      const fieldEls = [...this.formEl.querySelectorAll('[data-property]')];
      for (const fieldEl of fieldEls) delete properties[fieldEl.dataset.property];

      const isWrapped = this.formEl.querySelector('[data-gift-wrap-toggle]').checked;
      if (isWrapped) {
        for (const fieldEl of fieldEls) {
          const value = fieldEl.type === 'checkbox' ? fieldEl.value : fieldEl.value.trim();
          if (value) properties[fieldEl.dataset.property] = value;
        }
        return properties;
      }

      // Cart change ignores an empty properties object, so blank the gift ones when nothing else is left
      if (Object.keys(properties).length) return properties;
      return Object.fromEntries(fieldEls.map((fieldEl) => [fieldEl.dataset.property, '']));
    }

    /** @param {Event} event */
    update(event) {
      const cartItemsEl = this.closest('cart-drawer-items, cart-items');
      if (!cartItemsEl) return;

      const quantity = Number(this.dataset.quantity);
      cartItemsEl.updateQuantity(this.dataset.line, quantity, event, 'gift-wrap-edit', undefined, this.getProperties());
    }
  }

  customElements.define('cart-gift-wrap', CartGiftWrap);
}
