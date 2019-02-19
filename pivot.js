export const Pivot = (inTable, inColumn) =>
{
    var i, j;
    var output;
    var row;
    var cell;
    output = [];
    rows: for(i in inTable.Rows)
    {
        row = inTable.Rows[i];
        cell = row[inColumn].toString().toLowerCase();
        uniques: for(j in output)
        {
            if(cell == output[j].Name)
            {
                output[j].Rows.push(row);
                continue rows;
            }
        }
        output.push({
            Name:cell,
            Header:inTable.Header,
            Rows:[row],
            Parent:inTable
        });
    }
    return output;
};

export const PivotTree = (inTable, inColumns, inDepth, inSums) =>
{
    var i, j;
    inTable.Children = Pivot(inTable, inColumns[inDepth]);
    inDepth++;
    if(inDepth == inColumns.length)
    {
        console.log("at max depth");
        inTable.Sums = [];
        for(i in inSums)
        {
            inTable.Sums[i] = 0;
            
        }
        for(i in inTable.Rows)
        {
            for(j in inSums)
            {
                inTable.Sums[j] += inTable.Rows[i][inSums];
            }
        }
        return;
    }
    for(i in inTable.Children)
    {
        PivotTree(inTable.Children[i], inColumns, inDepth);
    }
};