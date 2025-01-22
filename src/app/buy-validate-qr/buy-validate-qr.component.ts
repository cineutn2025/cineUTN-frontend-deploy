import { Component, OnDestroy, OnInit } from '@angular/core';
import { Buy } from '../interfaces/interfaces.js';
import { BuyService } from '../buy/buy.service';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';

@Component({
  selector: 'app-buy-validate-qr',
  templateUrl: './buy-validate-qr.component.html',
  styleUrls: ['./buy-validate-qr.component.css']
})
export class BuyValidateQrComponent implements OnDestroy {

  errorMessage: string | null = null;
  buyData: Buy = {
    id: 0,
    description: '',
    total: 0,
    fechaHora: new Date(),
    user: {
      id: 0,
      dni: '',
      name: '',
      surname: '',
      email: '',
      password: '',
      type: 'user',
      buys: []
    },
    status: '',
    tickets: []

  }

  private scannerControls: IScannerControls | null = null;

  constructor(private buyService: BuyService) { }

  scanQRCode() {
    const codeReader = new BrowserQRCodeReader(); //viene de @zxing/browser

    codeReader.decodeFromVideoDevice(undefined, 'video',
      (result, error, controls) => {
        if (controls) {
          this.scannerControls = controls; //guardamos los controles para poder detener la camara luego
        }
        if (result) {
          const token = result.getText(); // consigue el texto del qr
          this.validateQRCode(token); // Valida el QR con el backend
        }
        if (error) {
          this.errorMessage = 'No se detecta el QR. Intenta enfocarlo mejor.';
        }
      }
    )
  }

  validateQRCode(token: string) {
    this.buyService.validateQRCode(token).subscribe({
      next: (response) => {
        this.buyData = response.data;
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = 'El QR no es válido o ha expirado. Intente recargando el detalle de la compra';
        console.error('Error validating QR:', error);
      },
    });
  }

  ngOnDestroy() { //mata la camara cuando salismos del componente
    if (this.scannerControls) {
      this.scannerControls.stop(); // detenemos la camara
      console.log('Cámara detenida al salir del componente.');
    }
  }
}
