function createToast(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '10px 20px';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = 'white';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '16px';
    toast.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.5)';
    toast.style.transition = 'opacity 0.5s ease';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000); 
}


console.log('Toast script injected and running');
createToast('Focus Time Ended!');
