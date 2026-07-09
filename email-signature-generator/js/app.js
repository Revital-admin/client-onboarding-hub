document.addEventListener('DOMContentLoaded', () => {
  const formInputs = document.querySelectorAll('input');
  const signatureContainer = document.getElementById('signatureContainer');
  const copyBtn = document.getElementById('copyBtn');

  function renderPreview() {
    const name = document.getElementById('empName').value || '[Your Name]';
    const title = document.getElementById('empTitle').value || '[Your Title]';
    const email = document.getElementById('empEmail').value || '[yourname@revitalproductions.com]';
    const phone = document.getElementById('empPhone').value || '[Phone Number]';
    const calendar = document.getElementById('empCalendar').value || '';
    
    // Use an absolute URL for the logo so it works in emails
    // Replace with the actual hosted URL if available, but for now we'll assume a standard path or base64
    // Usually, signatures need a hosted image link. We will use a placeholder or relative path assuming they update it, but let's use the local logo.png for preview
    const logoUrl = 'https://i.ibb.co/3sZWqgD/logo.png'; // Placeholder for the actual hosted logo

    let bookRow = '';
    if (calendar) {
      bookRow = `
        <tr>
          <td style="padding: 0; padding-right: 12px; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #b94236;">Book</td>
          <td style="padding: 0; font-family: Arial, sans-serif; font-size: 13px;"><a href="${calendar}" style="color: #b94236; text-decoration: none; font-weight: bold;">Book a Call &rarr;</a></td>
        </tr>
      `;
    }

    const html = `
<div style="font-family: Arial, sans-serif; font-size: 13px; color: #333333; max-width: 600px;">
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
    <tr>
      <td valign="top" style="padding-right: 20px; border-right: 2px solid #b94236;">
        <img src="${logoUrl}" alt="Revital Productions" width="160" style="display: block; margin-top: 10px;" />
      </td>
      <td valign="top" style="padding-left: 20px;">
        <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #b94236;">${name}</div>
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #b94236; margin-bottom: 12px; font-weight: bold;">${title}</div>
        
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 0; padding-right: 12px; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #b94236;">Email</td>
            <td style="padding: 0; font-family: Arial, sans-serif; font-size: 13px;"><a href="mailto:${email}" style="color: #666666; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 0; padding-right: 12px; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #b94236; padding-top: 4px;">Phone</td>
            <td style="padding: 0; font-family: Arial, sans-serif; font-size: 13px; padding-top: 4px; color: #666666;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 0; padding-right: 12px; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #b94236; padding-top: 4px;">Website</td>
            <td style="padding: 0; font-family: Arial, sans-serif; font-size: 13px; padding-top: 4px;"><a href="https://revitalproductions.com" style="color: #b94236; text-decoration: none;">revitalproductions.com</a></td>
          </tr>
          <tr>
            <td style="padding: 0; padding-right: 12px; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #b94236; padding-top: 4px;">Address</td>
            <td style="padding: 0; font-family: Arial, sans-serif; font-size: 13px; padding-top: 4px; color: #666666;">Louisiana, USA</td>
          </tr>
          ${bookRow ? `<tr><td colspan="2" style="padding-top: 4px;"></td></tr>` + bookRow : ''}
        </table>
      </td>
    </tr>
  </table>
  <div style="font-family: Arial, sans-serif; font-size: 10px; color: #999999; line-height: 1.4; border-top: 1px solid #eeeeee; padding-top: 15px;">
    CONFIDENTIALITY NOTICE: This electronic mail message and any attachment hereto may contain confidential information of Revital Productions LLC, and is intended for the personal and confidential use of the intended recipient(s) only, or as expressly authorized by the sender. If you are not the intended recipient, and you have received this message in error, any review, distribution, or copying of this message or any attachment hereto is prohibited. If you have received this message in error, please promptly notify the sender and permanently delete it from your computer.
  </div>
</div>
    `;
    signatureContainer.innerHTML = html;
  }

  formInputs.forEach(input => {
    input.addEventListener('input', renderPreview);
  });

  copyBtn.addEventListener('click', () => {
    const range = document.createRange();
    range.selectNode(signatureContainer.firstElementChild);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
      document.execCommand('copy');
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      alert('Failed to copy. Please manually select and copy the preview.');
    }
    
    window.getSelection().removeAllRanges();
  });

  // Initial render
  renderPreview();
});
