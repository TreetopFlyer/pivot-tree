import {LitElement, html, css} from 'https://unpkg.com/lit-element/lit-element.js?module';
    
class Sum extends LitElement
{
    constructor()
    {

    }
    render()
    {
        return html`
        <div>

        </div>
        `;
    }
}

class PivotOverview extends LitElement
{
    constructor()
    {
        super();
        this.Active = false;
        this.Path = [];
        this.Edits = [];
        this.Goals = [];
    }

    static get properties()
    {
        return{
            Active:{type: Boolean},
            Path:{type: Array},
            Edits:{type: Array},
            Goals:{type: Array}
        };
    }

    HandlerDisplay()
    {
        this.dispatchEvent(new CustomEvent('display',
        {
            detail:{mode:!this.Active},
            bubbles:true,
            composed:true
        }));
    }

    render()
    {
        var buttonText;
        if(this.Active)
        {
            buttonText = "Hide";
        }
        else
        {
            buttonText = "Show";
        }

        return html`
        <div class="PivotOverview">
            <button @click="${this.HandlerDisplay}">${buttonText}</button>
            <ul>
            ${this.Path.map((inPath)=>
            {
                return html`<li>${inPath}</li>`;
            })}
            </ul>
        </div>
        `;
    }
}
customElements.define('pivot-overview', PivotOverview);