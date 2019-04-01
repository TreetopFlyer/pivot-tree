import { html, render } from 'https://unpkg.com/lit-html/lit-html.js';

var DisplayRoot = {};
var Model = {};
var Methods = {};

export var Render = {
    Init:(inElement, inModel, inMethods)=>
    {
        DisplayRoot = inElement;
        Model = inModel;
        Methods = inMethods;

        Render.Update();
    },
    Update: () =>
    {
        render( Render.Layout(Model, Methods), DisplayRoot);
    },
    Layout: (inModel, inMethods) =>
    {
        return html`
        <div class="Section">
            <h3>State</h3>
            <button @click=${ ()=>{inMethods.StateSave();Render.Update();} }>Save</button>
            ${inModel.History.map( (inItem, inIndex)=>{
                return html`<button @click=${ ()=>{inMethods.StateLoad(inModel.History[inIndex]);Render.Update();} }>${inIndex}</button>`;
            } )}
        </div>
        <div class="Section">
            <h3>Pivots</h3>
            ${Render.Pivots(inModel, inMethods)}
            ${Render.FormPivot(inModel, inMethods)}
        </div>
        <div class="Section">
            <h3>Edit</h3>
            ${Render.FormEdit(inModel.Form.Edit, inMethods)}
            ${Render.FormGoal(inModel.Form.Goal, inMethods)}
        </div>
        <div class="Section">
            <h3>View</h3>
            ${Render.Pivot(inModel, inMethods)}
        </div>
        `;
    },
    FormEdit:(inModel, inMethods)=>
    {
        var handlerSubmit = (inEvent)=>
        {
            inEvent.preventDefault();
            inMethods.FormEditSubmit();Render.Update();
        };
        var handlerDelete = (inEvent)=>
        {
            inEvent.preventDefault();
            inMethods.FormEditSubmit(true);Render.Update();
        };
        var handlerReset = ()=>
        {
            inMethods.FormEditReset();Render.Update();
        };

        var markupButtons;
        if(!inModel.Sum.HasEdit)
        {
            markupButtons = html`
            <button @click=${ handlerSubmit }>create</button>
            <button @click=${ handlerReset }>cancel</button>
            `;
        }
        else
        {
            markupButtons = html`
            <button @click=${ handlerSubmit }>update</button>
            <button @click=${ handlerReset }>cancel</button>
            <button @click=${ handlerDelete }>remove edit</button>
            `;
        }


        if(inModel.Value !== false)
        {
            return html`
            <form action="/" @submit=${handlerSubmit}>
                <h4>Local Edit</h4>
                <input type="text" value=${inModel.Value} @input=${ (inEvent)=>{
                    inModel.Value = parseFloat(inEvent.target.value);
                } }/>
                ${markupButtons}
            </form>`;
        }
    },
    FormGoal:(inModel, inMethods)=>
    {
        var handlerSubmit = (inEvent)=>
        {
            inEvent.preventDefault();
            inMethods.FormGoalSubmit();Render.Update();
        };
        var handlerDelete = (inEvent)=>
        {
            inEvent.preventDefault();
            inMethods.FormGoalSubmit(true);Render.Update();
        };
        var handlerReset = ()=>
        {
            inMethods.FormGoalReset();Render.Update();
        };

        var markupButtons;
        if(!inModel.Sum.HasGoal)
        {
            markupButtons = html`
            <button @click=${ handlerSubmit }>create</button>
            <button @click=${ handlerReset }>cancel</button>
            `;
        }
        else
        {
            markupButtons = html`
            <button @click=${ handlerSubmit }>update</button>
            <button @click=${ handlerReset }>cancel</button>
            <button @click=${ handlerDelete }>remove goal</button>
            `;
        }


        if(inModel.Value !== false)
        {
            return html`
            <form action="/" @submit=${handlerSubmit}>
                <h4>Goal</h4>
                <input type="text" .value=${inModel.Value} @input=${ (inEvent)=>{
                    inModel.Value = parseFloat(inEvent.target.value);
                } }/>
                ${markupButtons}
            </form>`;
        }
    },
    FormPivot: (inModel, inMethods) =>
    {
        return html`
        <div class="Pivot">
            <ul>
                ${inModel.Form.Pivot.Closed.map( (inItem)=>{
                    return html`<li>${inModel.Display[inItem]}</li>`
                })}
            </ul>
            <select @change=${(inEvent)=>{ inMethods.FormPivotUpdate(inEvent.target.selectedIndex-1); inEvent.target.selectedIndex = 0;Render.Update(); }}>
                <option>Add column</option>
                ${inModel.Form.Pivot.Open.map( (inItem)=>
                {
                    return html`<option>${inModel.Display[inItem]}</option>`
                })}
            </select>
            <button @click=${ ()=>{inMethods.FormPivotSubmit();Render.Update();}}>
                Create
            </button>
            <button @click=${ ()=>{inMethods.FormPivotReset();Render.Update();}}>
                Cancel
            </button>

        </div>
        `;
    },
    Pivots: (inModel, inMethods) =>
    {
        return inModel.Trees.map( (inItem)=>
        {
            var output;
            output = [];
            if(inModel.Active != inItem)
            {
                output.push(html`<button @click=${()=>{inMethods.PivotSelect(inItem);Render.Update();}}>Select</button>`);
            }
            return html`
            <div class="Pivot">
                <pivot-overview ?Active=${inModel.Active == inItem} .Path="${inItem.Pivot}"></pivot-overview>
                ${output}
                <ul @click=${ ()=>{inMethods.PivotSelect(inItem);Render.Update();} }>
                ${inItem.Pivot.map( (inItem)=>{
                    return html`<li>${inModel.Display[inItem]}</li>`;
                } )}
                </ul>
                <button @click=${()=>{inMethods.PivotDelete(inItem);Render.Update();}}>Delete</button>
                <p>
                    ${Render.BranchCondensed(inItem.Root, inMethods)}
                </p>
            </div>`;
        });
    },
    BranchCondensed:(inModel, inMethods)=>
    {
        var edits = [];
        var goals = [];

        inModel.Sums.map( (inItem)=>
        {
            if(inItem.HasGoal)
            {
                goals.push(html`
                    <button @click=${()=>{inMethods.FormGoalUpdate(inModel, inItem);Render.Update();}}>
                        Goal: ${inItem.Goal}:<strong>${inItem.Total - inItem.Goal}</strong>
                    </button>`);
            }

            if(inItem.HasEdit)
            {
                edits.push( html`
                    <button @click=${()=>{inMethods.FormEditUpdate(inModel, inItem);Render.Update();}}>
                    Edit: ${inItem.Local}
                    </button>` );
            }
        }
        );

        return html`
        <div class="Edits">
            ${edits.map( (inItem)=>{return inItem;} )}
        </div>
        <div class="Goals">
            ${goals.map( (inItem)=>{return inItem;} )}
        </div>
        ${inModel.Children.map( (inItem)=>{
            return Render.BranchCondensed(inItem, inMethods);
        } )}
        `;
    },
    Pivot: (inModel, inMethods) =>
    {
        if(!inModel.Active)
        {
            return false;
        }
        return html`
        <table cellpadding="0" cellspacing="0">
            <tr>
                <th class="Column"></th>
                ${inModel.Sums.map( (inItem)=>
                {
                    return html`
                    <th class="Value">(${inItem}</th>
                    <th class="Outside">+O)</th>
                    <th class="Local">*L</th>
                    <th class="Parent">*P</th>
                    <th class="Child">+C</th>
                    <th class="Total">=T</th>
                    <th class="Goal">-G)</th>`;
                })}
            </tr>
            ${inModel.Active.Root.Children.map( (inBranch)=>{
                return Render.Branch(inBranch, inMethods, []);
            })}
        </table>
        `;
    },
    Branch: (inModel, inMethods) =>
    {
        return html`
        <tr>
            <td>
                ${inModel.Name}
            </td>
            ${inModel.Sums.map( (inItem, inIndex)=>{

                var markupGoal;
                if(inItem.HasGoal)
                {
                    markupGoal = html`${inItem.Goal}: <strong>${inItem.Total - inItem.Goal}</strong>`;
                }
                else
                {
                    markupGoal = inItem.Goal;
                }
                return html`
                <td class="Value">(${inItem.Value}</td>
                <td class="Outside">+${inItem.Outside})</td>
                <td class="Local">*
                    <button @click=${()=>{inMethods.FormEditUpdate(inModel, inItem);Render.Update();}}>${inItem.Local}</button>
                </td>
                <td class="Parent">*${inItem.Parent}</td>
                <td class="Child">+${inItem.Child}</td>
                <td class="Total">=${inItem.Total}</td>
                <td class="Goal">-
                    <button @click=${()=>{inMethods.FormGoalUpdate(inModel, inItem);Render.Update();}}>${markupGoal}</button>
                </td>
                `;
            } )}
        </tr>
        ${inModel.Children.map( (inItem)=>{
            return Render.Branch(inItem, inMethods);
        } )}
        `;
    }
};